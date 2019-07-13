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
external_sio = socketio.RedisManager('redis://', write_only=True)


async def eventsHandlerTimer():
    while True:
        eventsHandler()
        logger.info("OK")
        await asyncio.sleep(TIMER)


def eventsHandler(id=None):
    if id:
        getDevice = dbGetDevice(None,None,None,id)
        external_sio.emit('message', str(getDevice["properties"]))

    logger.debug("Rule Check Started")
    getRules = dbGetTable("rules",None,1)

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
            setRuleTriggerStatus(ruleID,0)
            triggerStatus = True
        elif not ValidStatus and checkifActive == 0:
            setRuleTriggerStatus(ruleID,1)    
        else:
            pass    
        if triggerStatus:
            loop = asyncio.get_event_loop()
            loop.create_task(doThen(ruleData))    
    logger.debug("Rule Check Completed")
    
 
def validateIf(ruleData):
    ruleDataJson = ruleData["rule_if"]
    ruleID = ruleData["id"]
    ValidStatus = False
    for deviceCondition in ruleDataJson:
        conditionProperties = deviceCondition["properties"]
        conditionType = deviceCondition["condition"]
        deviceType = deviceCondition["type"]
        deviceId = deviceCondition["id"]
        if deviceType == "device":
            getDevice = dbGetDevice(None,None,None,deviceId)
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
                    ValidStatus = deviceClass.validateProperties(getDevice,conditionProperties,conditionType)
                except ImportError as error:
                    logger.error("%s" % str(error)) 
                except Exception as exception:
                    logger.error("%s" % str(exception))    
            else:
                logger.error("Device with %s Not Found" % str(deviceId))
                pass             
        else:
            logger.warning("No Valid Handlers Found for Rule")
    logger.debug("Rule If Condition %d %s" % (ruleID, str(ValidStatus)))
    return ValidStatus    


def validateAnd(ruleData):
    ruleDataJson = ruleData["rule_and"]
    ruleID = ruleData["id"]
    ValidStatus = False
    ValidStatusArray = []
    for deviceCondition in ruleDataJson:
        conditionProperties = deviceCondition["properties"]
        conditionType = deviceCondition["condition"]
        deviceType = deviceCondition["type"]
        deviceId = deviceCondition["id"]
        if deviceType == "device":
            getDevice = dbGetDevice(None,None,None,deviceId)
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
        else:
            logger.warning("No Valid Handlers Found for Rule")

    if(len(ValidStatusArray) > 0):
        if(len(ValidStatusArray) == 1):
            ValidStatus = ValidStatusArray[0]
        else:
            ValidStatus = all(x == ValidStatusArray[0] for x in ValidStatusArray)
    else:
        ValidStatus = True

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
            getDevice = dbGetDevice(None,None,None,deviceId)

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
                        dbInsertHistory("info","system",None,"Rule "+str(ruleID),"Triggered",1)     
                except ImportError as error:
                    logger.error("%s" % str(error)) 
                except Exception as exception:
                    logger.error("%s" % str(exception))
                    
            else:
                logger.error("Device with %s Not Found" % str(deviceId))
                pass             

        else:
            logger.warning("No Valid Handlers Found for Rule")

