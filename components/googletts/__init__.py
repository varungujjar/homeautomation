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
from ibm_watson import TextToSpeechV1, ApiException
import json
from os.path import join, dirname
import wave
import pyaudio
import sys

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
        # self.sync_dict_audio_library()

    async def playaudio(self,wav_file):    
        pygame.mixer.init(44000, -16, 1, 1024)
        pygame.mixer.init()
        pygame.mixer.music.load(wav_file)
        pygame.mixer.music.set_volume(1.0)
        pygame.mixer.music.play()



    def sync_dict_audio_library(self):
        dict_file = '/home/pi/components/googletts/dict.txt'
        words_dict = [line.rstrip('\n') for line in open(dict_file)]
        for word in words_dict:
            word_wav_file_p = '/home/pi/components/googletts/'+voice_dic_folder+'/'+word+'_p.wav'
            word_wav_file_m = '/home/pi/components/googletts/'+voice_dic_folder+'/'+word+'_m.wav'
            dic_word_p = os.path.exists(word_wav_file_p)
            dic_word_m = os.path.exists(word_wav_file_m)
            if not dic_word_p:
                logger.info("Downloading Word '"+word+"' Pause Pronounciation")
                self.ibm_tts_download_word(word,"p") 
            if not dic_word_m:
                logger.info("Downloading Word '"+word+"' Motion Pronounciation")
                self.ibm_tts_download_word(word,"m")


    def check_sync_dictionary(self,this_word):
        dict_file = '/home/pi/components/googletts/dict.txt'
        words_dict = [line.rstrip('\n') for line in open(dict_file)]
        if this_word not in words_dict:
            f = open(dict_file, 'a') 
            f.write(this_word+'\n')
            f.close()
   

    def detect_leading_silence(self,sound, silence_threshold=-50.0, chunk_size=10):
        trim_ms = 0 # ms
        assert chunk_size > 0 # to avoid infinite loop
        while sound[trim_ms:trim_ms+chunk_size].dBFS < silence_threshold and trim_ms < len(sound):
            trim_ms += chunk_size
        return trim_ms


    def ibm_tts_download_word(self,word,pron_type):
        result = False
        output_word_file = '/home/pi/components/googletts/en_female_dict_02/'+word+'_'+pron_type+'.wav'
        
        def write_audio_file(response):
            with open(output_word_file,'wb') as audio_file:
                audio_file.write(response.content) 

        if pron_type == "p":
            try:
                response = text_to_speech.synthesize(word, accept='audio/wav',voice="en-US_AllisonV3Voice").get_result()
                write_audio_file(response)
                result = True
            except ApiException as ex:
                logger.error("Api call with error "+str(ex.code))
                result = False
        elif pron_type == "m":
            try:
                response = text_to_speech.synthesize('<s>'+word+'<break time="500ms"/>dash</s>', accept='audio/wav',voice="en-US_AllisonV3Voice").get_result()
                write_audio_file(response)
                result = True
            except ApiException as ex:
                logger.error("Api call with error "+str(ex.code))
                result = False
        return result         
                


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

                    if dic_word:
                        wav_part_file = AudioSegment.from_wav(word_wav_file)
                        start_trim = self.detect_leading_silence(wav_part_file)
                        end_trim = self.detect_leading_silence(wav_part_file.reverse())
                        duration = len(wav_part_file)        
                        combined_wav += (wav_part_file[start_trim:duration-end_trim]).fade_out(2)
                    else:
                        self.check_sync_dictionary(word)
                        if self.ibm_tts_download_word(word,"p"):
                            wav_part_file = AudioSegment.from_wav(word_wav_file)
                            start_trim = self.detect_leading_silence(wav_part_file)
                            end_trim = self.detect_leading_silence(wav_part_file.reverse())
                            duration = len(wav_part_file)        
                            combined_wav += (wav_part_file[start_trim:duration-end_trim]).fade_out(2)
                        else:
                            wav_part_file = AudioSegment.silent(duration=500)
                            combined_wav += wav_part_file
                    
                else:
                    word_wav_file = '/home/pi/components/googletts/'+voice_dic_folder+'/'+word+'_m.wav'
                    dic_word = os.path.exists(word_wav_file)

                    if dic_word:
                        wav_part_file = AudioSegment.from_wav(word_wav_file)
                        start_trim = self.detect_leading_silence(wav_part_file)
                        end_trim = self.detect_leading_silence(wav_part_file.reverse())
                        duration = len(wav_part_file)        
                        combined_wav += (wav_part_file[start_trim:duration-1800]).fade_out(50) #700 google #fade 30 | #ibm 1650
                        combined_wav += AudioSegment.silent(duration=1) #google 35
                    else:
                        self.check_sync_dictionary(word)
                        if self.ibm_tts_download_word(word,"m"):
                            wav_part_file = AudioSegment.from_wav(word_wav_file)
                            start_trim = self.detect_leading_silence(wav_part_file)
                            end_trim = self.detect_leading_silence(wav_part_file.reverse())
                            duration = len(wav_part_file)        
                            combined_wav += (wav_part_file[start_trim:duration-1800]).fade_out(50) #700 google #fade 30 | #ibm 1650
                            combined_wav += AudioSegment.silent(duration=1) #google 35
                        else:
                            wav_part_file = AudioSegment.silent(duration=500)
                            combined_wav += wav_part_file       

        combined_wav = combined_wav.set_frame_rate(44000)
        combined_wav = combined_wav.set_channels(2)            
        combined_wav.export(sentence_wav_output, format="wav")
        loop.create_task(self.playaudio(sentence_wav_output))    
        return validStatus


    def sentence_words(self,paragraph):
            sentences = nltk.word_tokenize(paragraph)
            split_sentence = []
            special_characters = {"%":"percent","#":"hash","$":"dollar","@":"at",".":"fullstop", ",":"comma","!":"fullstop",":":"","?":""}
            for word in sentences:
                    this_word = word
                    if this_word.isdigit():
                            digit_length = len(this_word)
                            if digit_length == 4 and int(this_word) > 1009 and int(this_word) < 10000:
                                digit_break_apart = list(map(int,str(this_word)))
                                digit_join_make_sen = str(digit_break_apart[0])+str(digit_break_apart[1])+" "+str(digit_break_apart[2])+str(digit_break_apart[3])
                                
                                digit_get_words = nltk.word_tokenize(digit_join_make_sen)
                                combined_digit = ""
                                for digit_each in digit_get_words:
                                    combined_digit += num2words(int(digit_each))+" "

                                final_tokenise_digits = nltk.word_tokenize(combined_digit)
                                for digit in final_tokenise_digits:
                                    split_sentence.append(digit)
                            else:
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
                                                if special_characters[clean_word] is not "":
                                                    split_sentence.append(special_characters[clean_word])
                                            else:        
                                                    split_sentence.append(this_word.lower())
            return split_sentence


