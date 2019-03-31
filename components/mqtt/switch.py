import os, sys, json, ast
sys.path.insert(0, '../../')
from helpers.db import *
from publish import *

COMPONENT = 'mqtt'
CLASS_HEADER = 'class'
TYPE = 'switch'
STATE_ON = 1
STATE_OFF = 0
DEVICE_PROPERTIES = {'ip','mac','host','ssid','rssi','uptime','vcc','version','voltage','current','apparent','factor','energy','relay'}
DEVICE_ACTIONS = {'relay','publish','subscribe'}

class switch(object):
    def __init__(self):
        pass

    def dispatch_data(self,type,prop,actions,address):
        db_sync_device(type,prop,actions,address,COMPONENT)


    def publish(self,topic,value):
        mqttPublish(topic, value)


    def stateToggleChange(self,deviceId,relayId,state=None):
        getDevice = db_get_device(None,None,deviceId)
        if getDevice['type'] == TYPE:
            deviceActions = json.loads(getDevice['actions'])
            deviceProperties = json.loads(getDevice['properties'])
            deviceRelayState = int(deviceProperties['relay'][str(relayId)])
            cleanTopic = (deviceActions['subscribe']).strip('/')
            relayTopic = cleanTopic+'/relay/'+str(relayId)+deviceActions['relay']['topic']
            stateValues = {0:STATE_ON,1:STATE_OFF}
            if state is not None:
                stateValue = state
            else:
                stateValue = stateValues[deviceRelayState]  
            self.publish(relayTopic,stateValue)
        else:
            print('Toggle Not Supported on This Device')   

    
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
        deviceClass = devicePayload[CLASS_HEADER]
        deviceAddress = devicePayload['ip']
        deviceProperties = {}
        deviceActions = {}
        if TYPE in deviceClass:
            deviceProperties = json.dumps(self.getDeviceProperties(devicePayload))
            deviceActions = json.dumps(self.getDeviceActions(devicePayload))
        else:
            pass
        self.dispatch_data(deviceClass,deviceProperties,deviceActions,deviceAddress)
