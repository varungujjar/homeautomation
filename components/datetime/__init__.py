import os, sys
sys.path.append('../')
sys.path.append('../../')
import json
import asyncio
from helpers.logger import formatLogger
from helpers.db import *

import datetime as today
logger = formatLogger(__name__)

COMPONENT = "system"
TYPE = "datetime"
CLASS_HEADER = "class"


async def datetimeHandlerTimer():
    while True:
        # dbSyncDevice("datetime",{},{},"","system")
        await asyncio.sleep(1)


class  datetime(object):
    def __init__(self):
        pass
        

    def validateProperties(self,getDevice,conditionProperties,conditionType):
        validStatus = False
        getIfHours = conditionProperties["time"][0]
        getIfMinutes = conditionProperties["time"][1]
        now = today.datetime.now()
        # reference now.year, now.month, now.day, now.hour, now.minute, now.second
        if now.weekday() in conditionProperties["day"]:
            if getIfHours == now.hour and getIfMinutes == now.minute:
                validStatus = True
        return validStatus