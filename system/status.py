import os, sys
sys.path.append('../')
import json
import asyncio
import time
from helpers.logger import formatLogger
import socketio
import datetime
from datetime import datetime, timedelta
from helpers.dt import *

TIMER = 60 #seconds
CHECK_THRESHOLD = 900 #seconds if device did not respond it will be considered as offline

logger = formatLogger(__name__)
external_sio = socketio.RedisManager('redis://', write_only=True)


def deviceCheckIncoming(device):
    if device["online"] == 0:
        importDbModule = __import__("helpers.db", fromlist="db")
        importDbModule.dbSetDeviceStatus(device["id"],1)
        importDbModule.dbInsertHistory("success","device",None,device["room_name"] or device["component"],"Device "+device["name"]+" is now Online",1)
        logger.info("Device(%d) %s is online" % (device["id"],device["name"]))
        pass


async def statusHandler():
    while True:
        statusCheck()
        logger.info("OK")
        await asyncio.sleep(TIMER)


def statusCheck():
    importDbModule = __import__("helpers.db", fromlist="db")
    devices = importDbModule.dbGetAllDevices(0)
    for device in devices:
        now = datetime.now()
        modified = datetime.strptime(str(device["modified"]), '%Y-%m-%d %H:%M:%S')
        delta = now-modified
        seconds = delta.seconds
        if seconds > CHECK_THRESHOLD:
            logger.error("Device(%d) %s is offline" % (device["id"],device["name"]))
            importDbModule.dbInsertHistory("error","device",None,device["room_name"] or device["component"],"Device "+device["name"]+" went Offline",1)
            if device["online"] == 1:
                importDbModule.dbInsertHistory("error","device",None,device["room_name"] or device["component"],"Device "+device["name"]+" went Offline",1)
                importDbModule.dbSetDeviceStatus(device["id"],0)
                #set notification table with message

