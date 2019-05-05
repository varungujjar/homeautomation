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
        external_sio.emit("message", "Device "+device["name"]+" is online")
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
            logger.warning("Device(%d) %s is offline" % (device["id"],device["name"]))
            external_sio.emit("message", "Device "+device["name"]+" went offline")
            if device["online"] == 1:
                external_sio.emit("message", "Device "+device["name"]+" went offline")
                importDbModule.dbSetDeviceStatus(device["id"],0)
                #set notification table with message
    logger.debug("Status Check Completed")

