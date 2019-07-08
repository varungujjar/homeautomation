import os, sys
import json
import asyncio
from helpers.logger import formatLogger
from helpers.db import *
from system.rules import *
from publish import *

logger = formatLogger(__name__)

COMPONENT = "mqtt"
CLASS_HEADER = "class"
TYPE = "switch"
STATE_ON = 1
STATE_OFF = 0
DEVICE_PROPERTIES = {"ip","mac","host","ssid","rssi","uptime","vcc","version","voltage","current","apparent","factor","energy","relay","publish","subscribe"}
DEVICE_ACTIONS = {"relay"}

#{class:switch,actions{state:{type:int,on:1,off:0,topic:state},brightness{type:int,range:0-100,topic:brightness}}
#on_off
#brightness
#color_temp
#hs
#rgb
#white

class switch(object):
    def __init__(self):
        self.topic = 0


    def dispatchNotification(self,data,type):
        if type == "state":
            stateText = "Off"
            stateType = "default"
            if data["properties"]["relay"]["0"]:
                stateText = "On"
                stateType = "success"
            roomName = data["room_name"] or "None"
            message = data["name"] + " Switch Turned <b>"+stateText+"</b>"
            dbInsertHistory(stateType,"device",None,roomName,message,1)
        

    def publish(self,topic,value):
        loop = asyncio.get_event_loop()
        loop.create_task(publish(topic, value))
        
        
    def triggerAction(self,actions,deviceId):
        triggered = False
        if "relay" in actions:
            relays = actions["relay"]
            for relayId, state in relays.items():
                self.stateToggleChange(int(deviceId),int(relayId),int(state))
                triggered = True
        else:
            logger.error("The Device does not support this action")    
        return triggered


    def stateToggleChange(self,deviceId,relayId,state=None):
        getDevice = dbGetDevice(None,None,None,deviceId)
        if getDevice:      
            if getDevice["type"] == TYPE:        
                deviceActions = getDevice["actions"]
                deviceProperties = getDevice["properties"]
                deviceRelayState = int(deviceProperties["relay"][str(relayId)])
                cleanTopic = (deviceProperties["subscribe"]).strip("/")
                relayTopic = cleanTopic+deviceActions["relay"][str(relayId)]["topic"]
                stateValues = {0:deviceActions["relay"][str(relayId)]["on"],1:deviceActions["relay"][str(relayId)]["off"]}
                if state is not None:
                    stateValue = state
                else:
                    stateValue = stateValues[deviceRelayState]  
                self.publish(relayTopic,stateValue)
            else:
                logger.error("Toggle Not Supported on This Device")   

    
    def getDeviceProperties(self,payload):
        devicePropertiesData = {}
        for key, value in payload.items():
                if key in DEVICE_PROPERTIES:
                    devicePropertiesData[key] = value
                else:
                    pass
        return devicePropertiesData            


    def checkStateChanged(self,type,deviceAddress,deviceProperties):
        getDevice = dbGetDevice(COMPONENT,type,deviceAddress)
        state = False
        if getDevice:
            devicePropertiesLoad = getDevice["properties"]
            #print(devicePropertiesLoad)
            for key, value in devicePropertiesLoad["relay"].items():
                StateJson = deviceProperties
                newState = StateJson["relay"][key]
                currentState = value
                if newState != currentState:
                    state = True
        return state


    def getDeviceActions(self,payload):
        # deviceActionsData = {}
        deviceActionsData = {'relay': {
            '0': {'type': 'switch', 'topic': '/relay/0/set', 'on':1, 'off':0}
        }}
        # for key, value in payload["actions"].items():
        #         if key in DEVICE_ACTIONS:
        #             deviceActionsData[key] = value
        #         else:
        #             pass
        return deviceActionsData


    async def deviceHandler(self,topic,payload):
        devicePayload = json.loads(str(payload))
        deviceClass = devicePayload[CLASS_HEADER]
        deviceAddress = devicePayload["mac"]
        deviceProperties = {}
        deviceActions = {}
        
        if TYPE in deviceClass:
            deviceProperties = self.getDeviceProperties(devicePayload)
            deviceActions = self.getDeviceActions(devicePayload)
        else:
            pass
        state = False   
        state = self.checkStateChanged(deviceClass,deviceAddress,deviceProperties)
        dbSync = dbSyncDevice(deviceClass,deviceProperties,deviceActions,deviceAddress,COMPONENT)

        if dbSync and state:
            self.dispatchNotification(dbSync,"state")
            eventsHandler(dbSync["id"])
            
            


            
