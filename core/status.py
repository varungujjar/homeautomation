import os, sys
sys.path.append('../')
import json
import asyncio
import time
from helpers.logger import formatLogger
import datetime
from datetime import datetime, timedelta
from helpers.dt import *

TIMER = 60 #seconds
CHECK_THRESHOLD = 900 #seconds if device did not respond it will be considered as offline

logger = formatLogger(__name__)

def deviceCheckIncoming(device):
    if device["online"] == 0:
        importNotificationModule = __import__("core.notifications", fromlist="notifications")        
        importNotificationModule.storeNotification("success","device",device["room_name"] or device["component"],"Device "+device["name"]+" is now Online",True)
        importDbModule = __import__("helpers.db", fromlist="db")
        importDbModule.dbStore("devices",{"id":int(device["id"]),"online":1})
        logger.info("Device(%d) %s is online" % (device["id"],device["name"]))


async def statusHandler():
    while True:
        statusCheck()
        logger.info("OK")
        await asyncio.sleep(TIMER)


def statusCheck():
    importDbModule = __import__("helpers.db", fromlist="db")
    importNotificationModule = __import__("core.notifications", fromlist="notifications") 
    devices = importDbModule.dbGetDevices()
    for device in devices:
        now = datetime.now()
        modified = datetime.strptime(str(device["modified"]), '%Y-%m-%d %H:%M:%S')
        delta = now-modified
        seconds = delta.seconds
        if seconds > CHECK_THRESHOLD:
            logger.error("Device(%d) %s is offline" % (device["id"],device["name"]))
            importNotificationModule.pushNotification("error","device",device["room_name"] or device["component"],"Device "+device["name"]+" went Offline")
            if device["online"] == 1:
                importNotificationModule.storeNotification("error","device",device["room_name"] or device["component"],"Device "+device["name"]+" went Offline",True)
                importDbModule.dbStore("devices",{"id":int(device["id"]),"online":0})



