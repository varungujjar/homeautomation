import os, sys
sys.path.append('../')
sys.path.append('../../')
import json
import asyncio
from helpers.logger import formatLogger
from helpers.db import *
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="/home/pi/components/googletts/googleapi.json"
from google.cloud import texttospeech

logger = formatLogger(__name__)

class  googletts(object):
    def __init__(self):
        pass


    def triggerAction(self,getComponent,conditionProperties):
        message = ""
        message = str(conditionProperties["message"])
        logger.info(message)
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.types.SynthesisInput(text=message)
        voice = texttospeech.types.VoiceSelectionParams(
            language_code='en-US',
            name='en-US-Wavenet-F',
            ssml_gender=texttospeech.enums.SsmlVoiceGender.FEMALE)
        audio_config = texttospeech.types.AudioConfig(
            audio_encoding=texttospeech.enums.AudioEncoding.MP3)
        response = client.synthesize_speech(synthesis_input, voice, audio_config)
        with open('output.mp3', 'wb') as out:
            out.write(response.audio_content)
        os.system('omxplayer -o local output.mp3')
        validStatus = True
        return validStatus





