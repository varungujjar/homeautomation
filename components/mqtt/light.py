import os, sys
import json ,ast
sys.path.insert(0, '../../')
from helpers.db import *
#sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

COMPONENT = 'mqtt'
CLASS = 'switch'
DEVICE_PROPERTIES = {'ip','mac','host','ssid','rssi','uptime','vcc','version','voltage','current','apparent','factor','energy','relay'}
DEVICE_ACTIONS = {'relay','publish','subscribe'}
#{class:switch,actions{state:{type:int,on:1,off:0,topic:state},brightness{type:int,range:0-100,topic:brightness}}


#on_off
#brightness
#color_temp
#hs
#rgb
#white



class switch(object):
    def __init__(self, topic=None, payload=None):
        self.topic = topic
        self.payload = payload

    def dispatch_data(self,type,prop,actions,address):
        db_sync_device(type,prop,actions,address,COMPONENT)    

    
    def getDeviceProperties(self,payload):
        devicePropertiesData = {}
        for key, value in payload.iteritems():
                if key in DEVICE_PROPERTIES:
                    devicePropertiesData[key] = value
                else:
                    pass
        return devicePropertiesData            


    def getDeviceActions(self,payload):
        deviceActionsData = {}
        for key, value in payload['actions'].iteritems():
                if key in DEVICE_ACTIONS:
                    deviceActionsData[key] = value
                else:
                    pass
        return deviceActionsData


    def deviceHandler(self,topic,payload):
        devicePayload = json.loads(payload)
        deviceClass = devicePayload['class']
        deviceAddress = devicePayload['ip']
        deviceProperties = {}
        deviceActions = {}
        if CLASS in deviceClass:
            deviceProperties = ast.literal_eval(json.dumps(self.getDeviceProperties(devicePayload)))
            deviceActions = ast.literal_eval(json.dumps(self.getDeviceActions(devicePayload)))
        else:
            pass
        self.dispatch_data(deviceClass,deviceProperties,deviceActions,deviceAddress)
