import os, sys
sys.path.append('../')
import json
import asyncio
import time
from helpers.logger import formatLogger
import socketio
import datetime
from datetime import datetime, timedelta
from helpers.db import *
from helpers.dt import *

TIMER = 60 #seconds
CHECK_THRESHOLD = 900 #seconds if device did not respond it will be considered as offline

logger = formatLogger(__name__)
external_sio = socketio.RedisManager('redis://', write_only=True)


async def statusHandler():
    while True:
        statusCheck()
        logger.info("OK")
        await asyncio.sleep(TIMER)


def statusCheck():
    devices = dbGetAllDevices()
    for device in devices:
        now = datetime.now()
        modified = datetime.strptime(str(device["modified"]), '%Y-%m-%d %H:%M:%S')
        delta = now-modified
        seconds = delta.seconds
        if seconds > CHECK_THRESHOLD:
            logger.error("Device(%d) %s is offline" % (device["id"],device["name"]))
            if device["online"] == 1:
                external_sio.emit('message', "Device Offline"))
                #SET DB online to 0
                #set notification table with message
    logger.debug("Status Check Completed")