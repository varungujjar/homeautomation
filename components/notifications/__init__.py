import os, sys
sys.path.append('../')
sys.path.append('../../')
import json
import asyncio
from helpers.logger import formatLogger
from helpers.db import *
from system.notifications import *

logger = formatLogger(__name__)

class  notifications(object):
    def __init__(self):
        pass
        

    def triggerAction(self,getComponent,conditionProperties):
        print(conditionProperties["title"])
        print(conditionProperties["message"])
        storeNotification("default","notification",str(conditionProperties["title"]),str(conditionProperties["message"]), True)
        validStatus = True
        return validStatus