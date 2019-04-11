import os, sys
sys.path.append('./')
sys.path.append('../../')
import json
import asyncio
import logging
from helpers.db import *
from server import *
from system.events import *

logger = logging.getLogger(__name__)

COMPONENT = "mqtt"
CLASS_HEADER = "class"
TYPE = "switch"
STATE_ON = 1
STATE_OFF = 0
DEVICE_PROPERTIES = {"ip","mac","host","ssid","rssi","uptime","vcc","version","voltage","current","apparent","factor","energy","relay","publish","subscribe"}
DEVICE_ACTIONS = {"relay"}

class switch(object):
    def __init__(self):
        self.topic = 0


    def publish(self,topic,value):
        mqttPublish(topic, value)


    def triggerAction(self,actions,deviceData):
        deviceId = deviceData["id"]
        triggered = False
        if "relay" in actions:
            relays = actions["relay"]
            for relayId, state in relays.items():
                self.stateToggleChange(int(deviceId),int(relayId),int(state))
                triggered = True
        else:
            print("The Device does not support this action")    
        return triggered


    def stateToggleChange(self,deviceId,relayId,state=None):
        getDevice = dbGetDevice(None,None,deviceId)
        if getDevice:      
            if getDevice["type"] == TYPE:        
                deviceActions = json.loads(getDevice["actions"])
                deviceProperties = json.loads(getDevice["properties"])
                deviceRelayState = int(deviceProperties["relay"][str(relayId)])
                cleanTopic = (deviceProperties["subscribe"]).strip("/")
                relayTopic = cleanTopic+"/relay/"+str(relayId)+deviceActions["relay"]["topic"]
                stateValues = {0:STATE_ON,1:STATE_OFF}
                if state is not None:
                    stateValue = state
                else:
                    stateValue = stateValues[deviceRelayState]  
                self.publish(relayTopic,stateValue)
            else:
                print("Toggle Not Supported on This Device")   

    
    def getDeviceProperties(self,payload):
        devicePropertiesData = {}
        for key, value in payload.items():
                if key in DEVICE_PROPERTIES:
                    devicePropertiesData[key] = value
                else:
                    pass
        return devicePropertiesData            


    def checkStateChanged(self,deviceAddress,deviceProperties):
        getDevice = dbGetDevice(COMPONENT,deviceAddress)
        state = False
        if getDevice:
            devicePropertiesLoad = json.loads(getDevice["properties"])
            #print(devicePropertiesLoad)
            for key, value in devicePropertiesLoad["relay"].items():
                StateJson = json.loads(deviceProperties)
                newState = StateJson["relay"][key]
                currentState = value
                if newState != currentState:
                    state = True
        return state


    def getDeviceActions(self,payload):
        deviceActionsData = {}
        for key, value in payload["actions"].items():
                if key in DEVICE_ACTIONS:
                    deviceActionsData[key] = value
                else:
                    pass
        return deviceActionsData


    def deviceHandler(self,topic,payload):
        devicePayload = json.loads(str(payload))
        deviceClass = devicePayload[CLASS_HEADER]
        deviceAddress = devicePayload["mac"]
        deviceProperties = {}
        deviceActions = {}
        if TYPE in deviceClass:
            deviceProperties = json.dumps(self.getDeviceProperties(devicePayload))
            deviceActions = json.dumps(self.getDeviceActions(devicePayload))
        else:
            pass
        state = False   
        state = self.checkStateChanged(deviceAddress,deviceProperties)
        dbSync = dbSyncDevice(deviceClass,deviceProperties,deviceActions,deviceAddress,COMPONENT)
        #loop.create_task(eventsHandler(dbSync["id"]))
        if dbSync and state:
            relayState = json.dumps(json.loads(dbSync["properties"])["relay"])
            dbInsertHistory(dbSync["id"],dbSync["name"],dbSync["type"],dbSync["component"],"changed",relayState)
            loop.create_task(eventsHandler(dbSync["id"]))
            # loop = asyncio.get_event_loop()
            # loop.run_until_complete(eventsHandler())
            
            


            
