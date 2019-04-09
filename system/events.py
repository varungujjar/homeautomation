import os, sys, json
import asyncio
import time
import logging
sys.path.insert(0, '../')
import socketio
from datetime import datetime, timedelta, tzinfo
from helpers.db import *

external_sio = socketio.RedisManager('redis://', write_only=True)
logger = logging.getLogger(__name__)

def eventsHandler(id=None):
    if id:
        getDevice = dbGetDevice(None,None,id)
        #socketio.emit("message",getDevice["properties"])
    print("Start Check For Rules")
    getRules = dbGetAutomationRules()
    for ruleData in getRules:
        validateIfCondition = validateIf(ruleData)
        validateAndCondition = validateAnd(ruleData)
        if validateIfCondition and validateAndCondition:
            doThenCondition = doThen(ruleData)

    external_sio.emit('message', 'Hey there')
    now = datetime.datetime.now()
    print("Completed at %s",str(now))

async def emit_test():
    external_sio.emit('message', 'Hey there')
    return True      

def validateIf(ruleData):
    ifDataJson = json.loads(ruleData["if"])
    checkifActive = ruleData["trigger"]
    ruleID = ruleData["id"]
    status = False
    conditionStatus = False
    ifProperties = ifDataJson["properties"]
    ifType = ifDataJson["condition"]
    
    if "device" in ifDataJson:
        getDevice = dbGetDevice(None,None,ifDataJson["device"])
        getDeviceProperties = json.loads(getDevice["properties"])

        if getDevice:
            for key, value in ifProperties.items():
                if isinstance(value,dict):
                    for k, v in value.items():
                        getDeviceProperty= getDeviceProperties[key][k]
                        getIfProperty = ifProperties[key][k]
                else:
                    getDeviceProperty = getDeviceProperties[key]
                    getIfProperty = ifProperties[key]
                    
                if ifType == "=":
                    if getDeviceProperty == getIfProperty:
                        conditionStatus = True

                elif ifType == ">":
                    if getDeviceProperty > getIfProperty:
                        conditionStatus = True

                elif ifType == "<":
                    if getDeviceProperty < getIfProperty:
                        conditionStatus = True

        else:
            print("Device Not Found Rule Cannot Be Triggered")  

    elif "datetime" in ifDataJson:
        dateTimeType = ifDataJson["datetime"]
        
        if dateTimeType == "time":
            getIfHours = ifProperties["time"][0]
            getIfMinutes = ifProperties["time"][1]
            now = datetime.datetime.now()
            #reference now.year, now.month, now.day, now.hour, now.minute, now.second
            if now.weekday() in ifProperties["day"]:
                if getIfHours == now.hour and getIfMinutes == now.minute and now.second == 0:
                    conditionStatus = True

        if dateTimeType == "date":
            pass

    else:
        print("No Valid Handlers found for rule")

    if conditionStatus and checkifActive == 1:
        setAutomationTriggerStatus(ruleID,0)
        status = True
    elif not conditionStatus and checkifActive == 0:
        pass 
        setAutomationTriggerStatus(ruleID,1)    
    else:
        pass

    print(str(ruleID)+str(status))
    return status    


def validateAnd(ruleData):
    return True


def doThen(ruleData):
    thenDataJson = json.loads(ruleData["then"])
    checkifActive = ruleData["trigger"]
    ruleID = ruleData["id"]

    if "device" in thenDataJson:
        getDevice = dbGetDevice(None,None,thenDataJson["device"])
        getDeviceProperties = json.loads(getDevice["properties"])
        getDeviceActions = json.loads(getDevice["actions"])
        thenActions = thenDataJson["actions"]

        if getDevice:
            getDeviceModule = str(getDevice["type"])
            getDeviceClass = str(getDevice["type"])
            getDeviceComponent = str(getDevice["component"])
            #print(sys.path)

            try:
                buildComponentPath = "components."+getDeviceComponent+"."+getDeviceModule
                addSystemPath = "../components/"+getDeviceComponent
                # sys.path.insert(0, addSystemPath)
                sys.path.append(addSystemPath)   
                importModule = __import__(buildComponentPath, fromlist=getDeviceModule)
                importDeviceClass = getattr(importModule, getDeviceClass)
                deviceClass = importDeviceClass()
                status = deviceClass.triggerAction(thenActions,getDevice)
                if status:
                    print("Rule Triggered")
            except ImportError as error:
                print(error)
            except Exception as exception:
                print(exception)

        dbInsertHistory(ruleID,"Rule","rule","system","triggered",0)



