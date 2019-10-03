import os, sys
sys.path.append('../')
import json
import asyncio
import time
from helpers.logger import formatLogger
import socketio
from helpers.db import *

TIMER = 1
logger = formatLogger(__name__)

async def eventsHandlerTimer():
    while True:
        eventsHandler()
        logger.info("OK")
        await asyncio.sleep(TIMER)


def eventsHandler():
    logger.debug("Rule Check Started")
    getRules = dbGetTable("rules",{"published":1})
    for ruleData in getRules:
        validateIfCondition = validateIf(ruleData)
        validateAndCondition = validateAnd(ruleData)
        checkifActive = ruleData["trigger"]
        ruleID = ruleData["id"]
        ValidStatus = False
        triggerStatus = False
        if validateIfCondition and validateAndCondition:
            ValidStatus = True
        if ValidStatus and checkifActive == 1:
            dbStore("rules",{"id":int(ruleID),"trigger":0})
            triggerStatus = True
        elif not ValidStatus and checkifActive == 0:
            dbStore("rules",{"id":int(ruleID),"trigger":1})    
        else:
            pass    
        if triggerStatus:
            loop = asyncio.get_event_loop()
            loop.create_task(doThen(ruleData))    
    logger.debug("Rule Check Completed")
    

def validateConditions(ruleDataJson):  
    ValidStatusArray = []
    for deviceCondition in ruleDataJson:
        conditionProperties = deviceCondition["properties"]
        conditionType = deviceCondition["condition"]
        deviceType = deviceCondition["type"]
        deviceId = deviceCondition["id"]
        if deviceType == "device":
            getDevice = dbGetTable("devices",{"id":int(deviceId)})
            if getDevice:
                getDeviceModule = str(getDevice["type"])
                getDeviceClass = str(getDevice["type"])
                getDeviceComponent = str(getDevice["component"])
                try:
                    buildComponentPath = "components."+getDeviceComponent+"."+getDeviceModule
                    addSystemPath = "../components/"+getDeviceComponent
                    sys.path.append(addSystemPath) 
                    importModule = __import__(buildComponentPath, fromlist=getDeviceModule)
                    importDeviceClass = getattr(importModule, getDeviceClass)
                    deviceClass = importDeviceClass()
                    deviceConditionStatus = deviceClass.validateProperties(getDevice,conditionProperties,conditionType)
                    ValidStatusArray.append(deviceConditionStatus) 
                except ImportError as error:
                    logger.error("%s" % str(error)) 
                except Exception as exception:
                    logger.error("%s" % str(exception))         
            else:
                logger.error("Device with %s Not Found" % str(deviceId))
                pass             
        elif deviceType == "component":
            getComponent = dbGetTable("components",{"id":str(deviceId)})
            if getComponent:
                getSystemComponent = str(getComponent["id"])
                try:
                    buildComponentPath = "components."+getSystemComponent
                    addSystemPath = "../components/"+getSystemComponent
                    sys.path.append(addSystemPath) 
                    importModule = __import__(buildComponentPath, fromlist=getSystemComponent)
                    importDeviceClass = getattr(importModule,getSystemComponent)
                    deviceClass = importDeviceClass()
                    deviceConditionStatus = deviceClass.validateProperties(getComponent,conditionProperties,conditionType)
                    ValidStatusArray.append(deviceConditionStatus)
                except ImportError as error:
                    logger.error("%s" % str(error)) 
                except Exception as exception:
                    logger.error("%s" % str(exception))    
            else:
                logger.error("Component with %s Not Found" % str(deviceId))
                pass  
        else:
            logger.warning("No Valid Handlers Found for Rule")

    if(len(ValidStatusArray) > 0):
        if(len(ValidStatusArray) == 1):
            ValidStatus = ValidStatusArray[0]
        else:
            ValidStatus = all(x == ValidStatusArray[0] for x in ValidStatusArray)
    else:
        ValidStatus = True
    return ValidStatus     


def validateIf(ruleData):
    ruleDataJson = ruleData["rule_if"]
    ruleID = ruleData["id"]
    ValidStatus = False
    ValidStatus = validateConditions(ruleDataJson)
    logger.debug("Rule If Condition %d %s" % (ruleID, str(ValidStatus)))
    return ValidStatus    


def validateAnd(ruleData):
    ruleDataJson = ruleData["rule_and"]
    ruleID = ruleData["id"]
    ValidStatus = False
    ValidStatus = validateConditions(ruleDataJson)
    logger.debug("Rule And Condition %d %s" % (ruleID, str(ValidStatus)))
    return ValidStatus


async def doThen(ruleData):
    ruleDataJson = ruleData["rule_then"]
    checkifActive = ruleData["trigger"]
    ruleID = ruleData["id"]
    for deviceCondition in ruleDataJson:
        conditionProperties = deviceCondition["properties"]
        deviceType = deviceCondition["type"]
        deviceId = deviceCondition["id"]

        if deviceType == "device":
            getDevice = dbGetTable("devices",{"id":int(deviceId)})
            if getDevice:
                getDeviceModule = str(getDevice["type"])
                getDeviceClass = str(getDevice["type"])
                getDeviceComponent = str(getDevice["component"])
                try:
                    buildComponentPath = "components."+getDeviceComponent+"."+getDeviceModule
                    addSystemPath = "../components/"+getDeviceComponent
                    sys.path.append(addSystemPath) 
                    importModule = __import__(buildComponentPath, fromlist=getDeviceModule)
                    importDeviceClass = getattr(importModule, getDeviceClass)
                    deviceClass = importDeviceClass()
                    triggerStatus = deviceClass.triggerAction(getDevice,conditionProperties)
                    if triggerStatus:
                        logger.info("Rule %s Triggered" % ruleID)            
                except ImportError as error:
                    logger.error("%s" % str(error)) 
                except Exception as exception:
                    logger.error("%s" % str(exception)) 
            else:
                logger.error("Device with %s Not Found" % str(deviceId))
                pass             
        elif deviceType == "component":
            getComponent = dbGetTable("components",{"id":str(deviceId)})
            if getComponent:
                getSystemComponent = str(getComponent["id"])
                try:
                    buildComponentPath = "components."+getSystemComponent
                    addSystemPath = "../components/"+getSystemComponent
                    sys.path.append(addSystemPath) 
                    importModule = __import__(buildComponentPath, fromlist=getSystemComponent)
                    importDeviceClass = getattr(importModule, getSystemComponent)
                    deviceClass = importDeviceClass()
                    triggerStatus = deviceClass.triggerAction(getComponent,conditionProperties)
                    if triggerStatus:
                        logger.info("Rule %s Triggered" % ruleID)            
                except ImportError as error:
                    logger.error("%s" % str(error)) 
                except Exception as exception:
                    logger.error("%s" % str(exception)) 
            else:
                logger.error("Component with %s Not Found" % str(deviceId))
                pass 
        else:
            logger.warning("No Valid Handlers Found for Rule")
    dbStoreNotification("info","rule","Rule "+str(ruleID),"Triggered")
    dbPushNotification("info","rule","Rule "+str(ruleID),"Triggered")

