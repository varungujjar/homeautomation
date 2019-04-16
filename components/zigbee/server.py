import os, sys
import json
import logging
import asyncio
from xbee import XBee
from serial import Serial, SerialException

logger = logging.getLogger(__name__)

SERIALPORT = "/dev/ttyUSB0" 
BAUDRATE = 9600

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


def xbeeHandler(payload):
    xbeeData = getJsonData(payload)
    xbeePayload = xbeeData["payload"]
    logger.info("[ZIGBEE] %s" % str(payload))
    for key, value in xbeePayload.items():
        if key in SUPPORTED_HEADERS:
            if value in SUPPORTED_DEVICES:
                try:
                    importDevice = __import__(value)
                    importDeviceClass = getattr(importDevice, value)
                    deviceClass = importDeviceClass()
                    loop.create_task(deviceClass.deviceHandler(xbeeData))
                except ImportError as error:
                    logger.error("[ZIGBEE] %s" % str(error))
                    pass
            else:
                logger.warning("[ZIGBEE] Device Not Supported")    
        else:
            pass       
    return True    


xbee = XBee(ser, callback=xbeeHandler)


def closeSerialConnection():
    xbee.halt()
    ser.close()

async def zigbeeHandler():
    try:
        xbee
    except:
        pass    

