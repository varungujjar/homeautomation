import os, sys, json, ast, binascii
sys.path.insert(0, '../../')
from helpers.db import *

COMPONENT = 'xbee'
CLASS_HEADER = 'pr'
TYPE = 'sensor'
DEVICE_ENUM = {'t':['temperature','C'],'h':['humidity','%'],'p':['pressure','hPa'],'o':['gas','ppm'],'a':['altitude','m'],'l':['light','lux'],'v':['voltage','mAh']}
#DEVICE_PROPERTIES = {'temperature','humidity','pressure','gas','altitude','light','voltage'}

class sensor(object):
    def __init__(self):
        pass

    def dispatch_data(self,type,prop,actions,address):
        db_sync_device(type,prop,actions,address,COMPONENT)
    

    def getDeviceProperties(self,payload):
        devicePropertiesData = {}
        for key, value in payload.iteritems():
            if key != CLASS_HEADER:
                if key in DEVICE_ENUM:
                    devicePropertiesData[DEVICE_ENUM[key][0]] = {}
                    devicePropertiesData[DEVICE_ENUM[key][0]]['value'] = value
                    try:
                        if DEVICE_ENUM[key][1]:
                            devicePropertiesData[DEVICE_ENUM[key][0]]['unit'] = DEVICE_ENUM[key][1]
                    except IndexError:
                            pass
                else:
                    devicePropertiesData["unknown"]=value
        return devicePropertiesData           


    def deviceHandler(self,payload):
        devicePayload = payload
        deviceClass = devicePayload['payload'][CLASS_HEADER]
        deviceAddress = binascii.hexlify(devicePayload['source_addr_long'])
        deviceSourceAddress = binascii.hexlify(devicePayload['source_addr'])
        deviceProperties = {}
        deviceActions = {}
        if TYPE in deviceClass:
            deviceProperties = json.dumps(self.getDeviceProperties(devicePayload['payload']))
        else:
            pass
        self.dispatch_data(deviceClass,deviceProperties,deviceActions,deviceAddress)

            