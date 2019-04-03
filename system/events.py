import os, sys, json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from datetime import datetime, timedelta, tzinfo
import imp
import importlib, glob
sys.path.insert(0, '../')
from helpers.db import *


def eventsHandler():
    print("Start Check For Rules")
    getRules = dbGetAutomationRules()
    for ruleData in getRules:
        validateIfCondition = validateIf(ruleData)
        #validateAnd = validateAnd(ruleData)
        if validateIfCondition:
            doThenCondition = doThen(ruleData)
    print("Rule Check Cycle Completed")


def validateIf(ruleData):
    ifDataJson = json.loads(ruleData["if"])
    checkifActive = ruleData["trigger"]
    ruleID = ruleData["id"]

    if 'id' in ifDataJson:
        getDevice = dbGetDevice(None,None,ifDataJson["id"])
        getDeviceProperties = json.loads(getDevice["properties"])
        ifProperties = ifDataJson["properties"]
        ifType = ifDataJson["type"]

        if getDevice:
            for key, value in ifProperties.items():
                if isinstance(value,dict):
                    for k, v in value.items():
                        getDeviceProperty= getDeviceProperties[key][k]
                        getIfProperty = ifProperties[key][k]
                else:
                    getDeviceProperty = getDeviceProperties[key]
                    getIfProperty = ifProperties[key]
                    
                conditionStatus = False
                if ifType == "=":
                    if getDeviceProperty == getIfProperty:
                        conditionStatus = True

                elif ifType == ">":
                    if getDeviceProperty > getIfProperty:
                        conditionStatus = True

                elif ifType == "<":
                    if getDeviceProperty < getIfProperty:
                        conditionStatus = True

                status = False    
                if conditionStatus and checkifActive == 1:
                    setAutomationTriggerStatus(ruleID,0)
                    status = True
                elif not conditionStatus and checkifActive == 0:
                    pass 
                    setAutomationTriggerStatus(ruleID,1)    
                else:
                    pass
        else:
            print("Device Not Found Rule Cannot Be Triggered")    
    else:
        print("ID Not Found Error")
    return status    


def validateAnd(ruleData):
    pass


def doThen(ruleData):
    thenDataJson = json.loads(ruleData["then"])
    checkifActive = ruleData["trigger"]
    ruleID = ruleData["id"]

    if 'id' in thenDataJson:
        getDevice = dbGetDevice(None,None,thenDataJson["id"])
        getDeviceProperties = json.loads(getDevice["properties"])
        getDeviceActions = json.loads(getDevice["actions"])
        thenActions = thenDataJson["actions"]

        if getDevice:
            getDeviceModule = str(getDevice["type"])
            getDeviceClass = str(getDevice["type"])
            getDeviceComponent = str(getDevice["component"])

            try:
                buildComponentPath = "components."+getDeviceComponent+"."+getDeviceModule                
                importModule = __import__(buildComponentPath, fromlist=getDeviceModule)
                importDeviceClass = getattr(importModule, getDeviceClass)
                deviceClass = importDeviceClass()
                status = deviceClass.triggerAction(thenActions,getDevice)
                if status:
                    print("Rule Triggered")
                
            except ImportError:
                print("[RULE] Error Importing Device")
        dbInsertHistory(ruleID,"Rule","rule","system","triggered",0)            

