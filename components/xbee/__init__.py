import os, sys
import json
from helpers.logger import formatLogger
import asyncio
from xbee import XBee
from serial import Serial, SerialException
from helpers.db import *

logger = formatLogger(__name__)

SERIALPORT = getParmeters("xbee","serialport") 
BAUDRATE = getParmeters("xbee","baudrate")
CHECK_EVERY = 60
CHECK_LAST_THRESHOLD = 1800

try:
    ser = Serial(SERIALPORT, BAUDRATE)
except SerialException as exc:
    logger.exception("Unable to open serial port for Zigbee: %s", exc)

COMPONENT = "xbee"
SUPPORTED_HEADERS = {"pr"}
SUPPORTED_DEVICES = {"sensor","door","plant"}

loop = asyncio.get_event_loop() 

def getJsonFormatted(payload):
    payload = str(payload.decode())
    list_decode = payload.split(",")
    list_enum = []
    for eachItem in list_decode:
        list_enum.append(eachItem.split(":"))
    list_enum_dict = {k[0]:k[1] for k in list_enum}
    return list_enum_dict


def getJsonData(payload):
    jsonItem = {}
    for key, value in payload.items():
        if key != "rf_data":
            jsonItem[key] = value
    jsonItem["payload"] = {}
    jsonItem["payload"] = getJsonFormatted(payload["rf_data"])
    return jsonItem


async def deviceCheckHandler():
    await asyncio.sleep(CHECK_LAST_THRESHOLD)
    while True:
        devices = dbGetTable("devices",{"type":"sensor","component":"xbee"})
        dbCheckDeviceStatus(devices,CHECK_LAST_THRESHOLD)
        await asyncio.sleep(CHECK_EVERY)


def xbeeReceived(payload):
    xbeeData = getJsonData(payload)
    xbeePayload = xbeeData["payload"]
    logger.debug("%s" % str(payload))
    for key, value in xbeePayload.items():
        if key in SUPPORTED_HEADERS:
            if value in SUPPORTED_DEVICES:
                try:
                    importDevice = __import__("components.xbee."+value, fromlist=value)
                    importDeviceClass = getattr(importDevice, value)
                    deviceClass = importDeviceClass()
                    loop.create_task(deviceClass.deviceHandler(xbeeData))
                except ImportError as error:
                    logger.error("%s" % str(error))
                    pass
            else:
                logger.warning("Device Not Supported")    
        else:
            pass       
    return True    


xbee = XBee(ser, callback=xbeeReceived)


def closeSerialConnection():
    xbee.halt()
    ser.close()

async def xbeeHandler():
    loop = asyncio.get_event_loop()
    loop.create_task(deviceCheckHandler())
    try:
        xbee
    except:
        pass    

