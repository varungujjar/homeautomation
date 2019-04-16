import os, sys
sys.path.append('./')
sys.path.append('../../')
import json
import ast
import asyncio
import binascii
import logging
from helpers.db import *
from system.events import *

logger = logging.getLogger(__name__)

COMPONENT = "xbee"
TYPE = "sensor"
CLASS_HEADER = "pr"
DEVICE_ENUM = {"t":["temperature","C"],"h":["humidity","%"],"p":["pressure","hPa"],"o":["gas","ppm"],"a":["altitude","m"],"l":["light","lux"],"v":["voltage","mAh"]}
#DEVICE_PROPERTIES = {"temperature","humidity","pressure","gas","altitude","light","voltage"}

class sensor(object):
    def __init__(self):
        pass


    def getDeviceProperties(self,payload):
        devicePropertiesData = {}
        for key, value in payload.items():
            if key != CLASS_HEADER:
                if key in DEVICE_ENUM:
                    devicePropertiesData[DEVICE_ENUM[key][0]] = {}
                    devicePropertiesData[DEVICE_ENUM[key][0]]["value"] = float(value)
                    try:
                        if DEVICE_ENUM[key][1]:
                            devicePropertiesData[DEVICE_ENUM[key][0]]["unit"] = DEVICE_ENUM[key][1]
                    except IndexError:
                            pass
                else:
                    devicePropertiesData["unknown"]=value
        return devicePropertiesData           


    async def deviceHandler(self,payload):
        devicePayload = payload
        deviceClass = devicePayload["payload"][CLASS_HEADER]
        deviceAddress = str(binascii.hexlify(devicePayload["source_addr_long"]).decode())
        deviceSourceAddress = str(binascii.hexlify(devicePayload["source_addr"]).decode())
        deviceProperties = {}
        deviceActions = {}
        if TYPE in deviceClass:
            deviceProperties = json.dumps(self.getDeviceProperties(devicePayload["payload"]))
        else:
            pass
        logger.info("[ZIGBEE] %s" % str(deviceProperties))
        print(deviceProperties)
        dbSyncDevice(deviceClass,deviceProperties,deviceActions,deviceAddress,COMPONENT)
        eventsHandler()
        

            