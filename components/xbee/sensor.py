import os, sys
sys.path.append('./')
sys.path.append('../../')
import json
import ast
import asyncio
import binascii
from helpers.logger import formatLogger
from helpers.db import *

logger = formatLogger(__name__)

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



    def validateProperties(self,getDevice,conditionProperties,conditionType):
        validStatus = False
        getDeviceProperties = getDevice["properties"]
        getDevicePropertiesKeys = []
        for key, value in getDeviceProperties.items():
            getDevicePropertiesKeys.append(key)    
        for key, value in conditionProperties.items():
            if key in getDevicePropertiesKeys:
                if isinstance(value,dict):
                    for k, v in value.items():
                        getDeviceProperty= getDeviceProperties[key][k]
                        getIfProperty = conditionProperties[key][k]
                else:
                    getDeviceProperty = getDeviceProperties[key]
                    getIfProperty = conditionProperties[key]
                    
                if conditionType == "=":
                    if getDeviceProperty == getIfProperty:
                        validStatus = True

                elif conditionType == ">":
                    if getDeviceProperty > getIfProperty:
                        validStatus = True

                elif conditionType == "<":
                    if getDeviceProperty < getIfProperty:
                        validStatus = True
        return validStatus



    async def deviceHandler(self,payload):
        devicePayload = payload
        deviceClass = devicePayload["payload"][CLASS_HEADER]
        deviceAddress = str(binascii.hexlify(devicePayload["source_addr_long"]).decode())
        deviceSourceAddress = str(binascii.hexlify(devicePayload["source_addr"]).decode())
        deviceProperties = {}
        deviceActions = {}
        if TYPE in deviceClass:
            deviceProperties = self.getDeviceProperties(devicePayload["payload"])
        else:
            pass
        logger.info("%s" % str(deviceProperties))
        dbSyncDevice(deviceAddress,COMPONENT,deviceClass,deviceProperties,deviceActions)
        

            