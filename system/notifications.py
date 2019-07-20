import os, sys
sys.path.append('../')
import json
import asyncio
import time
from helpers.logger import formatLogger
import socketio
from helpers.db import *

logger = formatLogger(__name__)

def sioConnect():
	sio = socketio.RedisManager('redis://', write_only=True)
	return sio


def storeNotification(alert_class,type,title,message,push): #true push, false
    dbStore("notifications",{"id":0,"class":str(alert_class),"type":str(type),"title":str(title),"message":str(message)})
    if push:
        pushNotification(alert_class,type,title,message)


def pushNotification(alert_class,type,title,message):
    data = {}
    data["type"] = alert_class
    data["title"] = title
    data["message"] = message
    sioConnect().emit("notification", data)
