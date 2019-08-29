import os, sys
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

logger = formatLogger(__name__)

class  googletts(object):
    def __init__(self):
        pass

    async def playaudio(self):
        pygame.mixer.init(48000, -16, 1, 1024)
        pygame.mixer.init()
        pygame.mixer.music.load("/home/pi/components/googletts/output.wav")
        pygame.mixer.music.set_volume(1.0)
        pygame.mixer.music.play()

    def triggerAction(self,getComponent,conditionProperties):
        message = ""
        message = str(conditionProperties["message"])
        logger.info(message)
        validStatus = True

        split_message = message.split()    
        print(split_message)
        # client = texttospeech.TextToSpeechClient()
        # synthesis_input = texttospeech.types.SynthesisInput(text=message)
        # voice = texttospeech.types.VoiceSelectionParams(
        #     language_code='en-US',
        #     # name='en-US-Wavenet-F',
        #     ssml_gender=texttospeech.enums.SsmlVoiceGender.FEMALE)
        # audio_config = texttospeech.types.AudioConfig(
        #     audio_encoding=texttospeech.enums.AudioEncoding.LINEAR16)
        # response = client.synthesize_speech(synthesis_input, voice, audio_config)
        # with open('/home/pi/components/googletts/output.wav', 'wb') as out:
        #     out.write(response.audio_content)
        # loop = asyncio.get_event_loop()
        # loop.create_task(self.playaudio())    
        return validStatus





