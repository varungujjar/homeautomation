import os, sys, json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime, timedelta, tzinfo
import imp
import importlib, glob
sys.path.insert(0, '../')
from helpers.db import *

UPDATE_EVERY = 1 #seconds

def state():
    value = "switch"
    component = "components.mqtt.switch"
    try:
        importModule = __import__(component, fromlist=value)
        importDeviceClass = getattr(importModule, value)
        deviceClass = importDeviceClass()
        deviceClass.stateToggleChange(9, 0)
    except ImportError:
        print("[MQTT] Error Importing Device")
    print("Hey")


def eventsHandler():
    getRules = dbGetAutomationRules()
    for ruleData in getRules:

        andData = ruleData["and"]
        thenData = ruleData["then"]

        ## If Condition
        ifDataJson = json.loads(ruleData["if"])

        if 'id' in ifDataJson:

            getDevice = dbGetDevice(None,None,ifDataJson["id"])
            getDeviceProperties = json.loads(getDevice["properties"])
            ifProperties = ifDataJson["properties"]
            ifType = ifDataJson["type"]

            if getDevice:
                getDeviceModule = str(getDevice["type"])
                getDeviceClass = str(getDevice["type"])
                getDeviceComponent = str(getDevice["component"])
                try:
                    buildComponentPath = "components."+getDeviceComponent+"."+getDeviceModule                
                    importModule = __import__(buildComponentPath, fromlist=getDeviceModule)
                    importDeviceClass = getattr(importModule, getDeviceClass)
                    deviceClass = importDeviceClass()
                    
                except ImportError:
                    print("[RULE] Error Importing Device")    

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
                            deviceClass.stateToggleChange(9, 0)
                    #print(conditionStatus)

            else:
                print("Device Not Found Rule Cannot Be Triggered")    
        else:
            print("ID Not Found Error")
        ##end if Condition



def validateIf(ifData):
    getJson = json.loads(ifData)
    

def validateAnd():
    pass


def validateStatements():
    pass



def doThen():
    pass




sched = BlockingScheduler()
sched.add_job(eventsHandler, "interval", seconds=UPDATE_EVERY)
sched.start()