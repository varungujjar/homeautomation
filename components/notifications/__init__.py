import os, sys
sys.path.append('../')
sys.path.append('../../')
import json
import asyncio
from helpers.logger import formatLogger
from helpers.db import *
import socketio

logger = formatLogger(__name__)

class  notifications(object):
    def __init__(self):
        pass

    def sioConnect(self):
        sio = socketio.RedisManager('redis://', write_only=True)
        return sio    

    def triggerAction(self,getComponent,conditionProperties):
        title = ""
        message = ""
        title = str(conditionProperties["title"])
        message = str(conditionProperties["message"])
        logger.info(title+":"+message)
        insertId = dbStore("notifications",{"id":0,"class":"default","type":"notification","title":title,"message":message,"read":0})
        data = {}
        data["id"] = insertId
        data["title"] = title
        data["title"] = title
        data["message"] = message
        self.sioConnect().emit("OverlayNotification", data)
        validStatus = True
        return validStatus