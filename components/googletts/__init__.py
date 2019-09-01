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
from ibm_watson import TextToSpeechV1
import json
from os.path import join, dirname


text_to_speech = TextToSpeechV1(
    iam_apikey='YAPspnQOd7jK9NuT44RsnoGTzDE7Q5aUczShvVzLnTG4',
    url='https://gateway-lon.watsonplatform.net/text-to-speech/api'
)

voice_dic_folder = 'en_female_dict_02'



# import subprocess  
# subprocess.Popen("aplay file.wav") 

logger = formatLogger(__name__)

class  googletts(object):
    def __init__(self):
        pass

    async def playaudio(self,wav_file):
        pygame.mixer.init(22000, -16, 1, 1024)
        pygame.mixer.init()
        pygame.mixer.music.load(wav_file)
        pygame.mixer.music.set_volume(1.0)
        pygame.mixer.music.play()


    def sync_dictionary(self,this_word):
        dict_file = '/home/pi/components/googletts/dict.txt'
        words_dict = [line.rstrip('\n') for line in open(dict_file)]

        if this_word not in words_dict:
            f = open(dict_file, 'a') 
            f.write(this_word+'\n')
            f.close()

        for word in words_dict:
            word_wav_file_p = '/home/pi/components/googletts/'+voice_dic_folder+'/'+word+'_p.wav'
            word_wav_file_m = '/home/pi/components/googletts/'+voice_dic_folder+'/'+word+'_m.wav'
            dic_word_p = os.path.exists(word_wav_file_p)
            dic_word_m = os.path.exists(word_wav_file_m)

            if not dic_word_p:
                self.ibm_tts_download_word(word,"p")
                logger.info("Downloading Word '"+word+"' Pause Pronounciation")
                
            if not dic_word_m:
                self.ibm_tts_download_word(word,"m")
                logger.info("Downloading Word '"+word+"' Motion Pronounciation")

        return True
   



    def detect_leading_silence(self,sound, silence_threshold=-50.0, chunk_size=10):
        trim_ms = 0 # ms
        assert chunk_size > 0 # to avoid infinite loop
        while sound[trim_ms:trim_ms+chunk_size].dBFS < silence_threshold and trim_ms < len(sound):
            trim_ms += chunk_size
        return trim_ms


    def ibm_tts_download_word(self,word,pron_type):
        output_word_file = '/home/pi/components/googletts/en_female_dict_02/'+word+'_'+pron_type+'.wav'
        with open(output_word_file,'wb') as audio_file:
            if pron_type == "p":
                response = text_to_speech.synthesize(word, accept='audio/wav',voice="en-US_AllisonV3Voice").get_result()
            elif pron_type == "m":
                response = text_to_speech.synthesize('<s>'+word+'<break time="500ms"/>dash</s>', accept='audio/wav',voice="en-US_AllisonV3Voice").get_result()
            audio_file.write(response.content)


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
            sentence_wav_output = '/home/pi/components/googletts/joinedFile2.wav'
            if word == "fullstop" or word == "comma":
                wav_part_file = AudioSegment.silent(duration=500)
                combined_wav += wav_part_file
            else:
                if idx == total_sentence_len or is_next_word_fullstop:
                    word_wav_file = '/home/pi/components/googletts/'+voice_dic_folder+'/'+word+'_p.wav'
                    dic_word = os.path.exists(word_wav_file)
                    if not dic_word:
                        if self.sync_dictionary(word):                 
                            wav_part_file = AudioSegment.from_wav(word_wav_file)
                            start_trim = self.detect_leading_silence(wav_part_file)
                            end_trim = self.detect_leading_silence(wav_part_file.reverse())
                            duration = len(wav_part_file)        
                            combined_wav += (wav_part_file[start_trim:duration-end_trim]).fade_out(2)
                            # combined_wav += AudioSegment.silent(duration=30)    
                else:
                    word_wav_file = '/home/pi/components/googletts/'+voice_dic_folder+'/'+word+'_m.wav'
                    dic_word = os.path.exists(word_wav_file)
                    if not dic_word:
                        if self.sync_dictionary(word):
                            wav_part_file = AudioSegment.from_wav(word_wav_file)
                            start_trim = self.detect_leading_silence(wav_part_file)
                            end_trim = self.detect_leading_silence(wav_part_file.reverse())
                            duration = len(wav_part_file)        
                            combined_wav += (wav_part_file[start_trim:duration-1800]).fade_out(50) #700 google #fade 30 | #ibm 1650
                            combined_wav += AudioSegment.silent(duration=1) #google 35
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


