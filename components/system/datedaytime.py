import os, sys

import json
from helpers.logger import formatLogger
import datetime
logger = formatLogger(__name__)

COMPONENT = "system"
TYPE = "datetime"
CLASS_HEADER = "class"


class datedaytime(object):
    def __init__(self):
        pass
        

    def validateProperties(self,deviceId,conditionProperties,conditionType):
        validStatus = False
        getIfHours = conditionProperties["time"][0]
        getIfMinutes = conditionProperties["time"][1]
        now = datetime.datetime.now()
        # reference now.year, now.month, now.day, now.hour, now.minute, now.second
        if now.weekday() in conditionProperties["day"]:
            if getIfHours == now.hour and getIfMinutes == now.minute and now.second == 0:
                validStatus = True
        return validStatus