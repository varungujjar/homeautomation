import os, sys
sys.path.append('../')
sys.path.append('../../')
import json
import asyncio
from helpers.logger import formatLogger
from helpers.db import *

import datetime as today
logger = formatLogger(__name__)

class  notifications(object):
    def __init__(self):
        pass
        

    def validateProperties(self,getDevice,conditionProperties,conditionType):
        print(conditionProperties["title"])
        print(conditionProperties["message"])
        validStatus = True
        return validStatus