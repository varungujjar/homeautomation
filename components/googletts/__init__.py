import os, sys
import os.path
sys.path.append('../')
sys.path.append('../../')
import json
import subprocess
import asyncio
from helpers.logger import formatLogger
from helpers.db import *
import os
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="/home/pi/components/googletts/googleapi.json"
from google.cloud import texttospeech
import pygame
import nltk
import ipaddress
from num2words import num2words
from pydub import AudioSegment

# import subprocess  
# subprocess.Popen("aplay file.wav") 

logger = formatLogger(__name__)

class  googletts(object):
    def __init__(self):
        pass

    async def playaudio(self,wav_file):
        pygame.mixer.init(48000, -16, 1, 1024)
        pygame.mixer.init()
        pygame.mixer.music.load(wav_file)
        pygame.mixer.music.set_volume(1.0)
        pygame.mixer.music.play()


    def detect_leading_silence(self,sound, silence_threshold=-50.0, chunk_size=5):
        trim_ms = 0 # ms
        assert chunk_size > 0 # to avoid infinite loop
        while sound[trim_ms:trim_ms+chunk_size].dBFS < silence_threshold and trim_ms < len(sound):
            trim_ms += chunk_size
        return trim_ms


    def google_tts_download_word(self,word,pron_type):
        client = texttospeech.TextToSpeechClient()
        if pron_type == "p":
            synthesis_input = texttospeech.types.SynthesisInput(text=word)
        elif pron_type == "m":
            synthesis_input = texttospeech.types.SynthesisInput(text=word+" dash")
        voice = texttospeech.types.VoiceSelectionParams(
            language_code='en-US',
            # name='en-US-Wavenet-F',
            ssml_gender=texttospeech.enums.SsmlVoiceGender.FEMALE)
        audio_config = texttospeech.types.AudioConfig(
            audio_encoding=texttospeech.enums.AudioEncoding.LINEAR16)
        response = client.synthesize_speech(synthesis_input, voice, audio_config)
        output_word_file = '/home/pi/components/googletts/en_female_dict_01/'+word+'_'+pron_type+'.wav'
        with open(output_word_file, 'wb') as out:
            out.write(response.audio_content)
        # if pron_type == "m":
        #     word_wav_file = AudioSegment.from_wav(output_word_file)
        #     duration = len(word_wav_file)
        #     combined_wav = word_wav_file[:duration-675]
        #     combined_wav.export(output_word_file, format="wav")


    def triggerAction(self,getComponent,conditionProperties):
        loop = asyncio.get_event_loop()
        message = ""
        message = str(conditionProperties["message"])
        logger.info(message)
        validStatus = True
        sentence = self.sentence_words(message)
        logger.info(sentence)
        combined_wav = AudioSegment.empty()   
        for idx, word in enumerate(sentence):
            is_next_word_fullstop = False
            get_next_idx = idx+1
            if get_next_idx < len(sentence):
                get_next_word = sentence[get_next_idx]
                if get_next_word == "fullstop" or get_next_word == "comma":
                    is_next_word_fullstop = True

            total_sentence_len = len(sentence)-1
            voice_dic_folder = 'en_female_dict_01'
            sentence_wav_output = '/home/pi/components/googletts/joinedFile2.wav'
            if word == "fullstop" or word == "comma":
                wav_part_file = AudioSegment.silent(duration=500)
                combined_wav += wav_part_file
            else:
                if idx == total_sentence_len or is_next_word_fullstop:
                    word_wav_file = '/home/pi/components/googletts/'+voice_dic_folder+'/'+word+'_p.wav'
                    dic_word = os.path.exists(word_wav_file)
                    if dic_word:
                        pass
                    else:
                        self.google_tts_download_word(word,"p")
                    wav_part_file = AudioSegment.from_wav(word_wav_file)
                    start_trim = self.detect_leading_silence(wav_part_file)
                    end_trim = self.detect_leading_silence(wav_part_file.reverse())
                    duration = len(wav_part_file)        
                    combined_wav += (wav_part_file[start_trim:duration-end_trim]).fade_out(2)
                    # combined_wav += AudioSegment.silent(duration=30)    
                else:
                    word_wav_file = '/home/pi/components/googletts/'+voice_dic_folder+'/'+word+'_m.wav'
                    dic_word = os.path.exists(word_wav_file)
                    if dic_word:
                        pass
                    else:
                        self.google_tts_download_word(word,"m")
                    wav_part_file = AudioSegment.from_wav(word_wav_file)
                    duration_chop = len(wav_part_file)
                    chop_dash_output = wav_part_file[:duration_chop-700]
                    start_trim = self.detect_leading_silence(chop_dash_output)
                    end_trim = self.detect_leading_silence(chop_dash_output.reverse())
                    duration = len(chop_dash_output)        
                    combined_wav += (chop_dash_output[start_trim:duration-end_trim]).fade_out(2)
                    combined_wav += AudioSegment.silent(duration=35)
                #crossfade = combined_wav.append(sound2, crossfade=5000)                                                          
        combined_wav.export(sentence_wav_output, format="wav")
        loop.create_task(self.playaudio(sentence_wav_output))    
        return validStatus


    def sentence_words(self,paragraph):
            sentences = nltk.word_tokenize(paragraph)
            split_sentence = []
            special_characters = {"%":"percent","#":"hash","$":"dollar","@":"at",".":"fullstop", ",":"comma"}
            for word in sentences:
                    this_word = word
                    if this_word.isdigit():
                            get_num2words_digit = nltk.word_tokenize(num2words(int(this_word)))
                            for digit in get_num2words_digit:
                                    split_sentence.append(digit) 
                    else:
                            try:
                                    float(this_word) and '.' in this_word
                                    get_num2words_decimal = nltk.word_tokenize(num2words(this_word))
                                    for digit_decimal in get_num2words_decimal:
                                            split_sentence.append(digit_decimal)
                            except ValueError:
                                    clean_word = this_word.lower()
                                    try:
                                            ipaddress.ip_address(clean_word)
                                            seperated_ip = clean_word.split(".")
                                            seperated_ip_len = len(seperated_ip)
                                            
                                            for idx, number in enumerate(seperated_ip):
                                                    get_num2words_decimal_ip = nltk.word_tokenize(num2words(number))
                                                    for digit_decimal_ip in get_num2words_decimal_ip:
                                                            split_sentence.append(digit_decimal_ip)
                                                    if idx < 3:
                                                            split_sentence.append("point")
                                    except ValueError:
                                            if clean_word in special_characters:
                                                    split_sentence.append(special_characters[clean_word])
                                            else:        
                                                    split_sentence.append(this_word.lower())
            return split_sentence


