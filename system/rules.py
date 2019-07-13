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
        if validateIfCondition and validateAndCondition:
            loop = asyncio.get_event_loop()
            loop.create_task(doThen(ruleData))
            
    logger.debug("Rule Check Completed")
    
 

def validateIf(ruleData):
    ruleDataJson = ruleData["rule_if"]
    checkifActive = ruleData["trigger"]
    ruleID = ruleData["id"]
    ifValidStatus = False
    triggerStatus = False
    
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
                    ifValidStatus = deviceClass.validateProperties(getDevice,conditionProperties,conditionType) 
                except ImportError as error:
                    logger.error("%s" % str(error)) 
                except Exception as exception:
                    logger.error("%s" % str(exception))
                    
            else:
                logger.error("Device with %s Not Found" % str(deviceId))
                pass             

        else:
            logger.warning("No Valid Handlers Found for Rule")

        if ifValidStatus and checkifActive == 1:
            setRuleTriggerStatus(ruleID,0)
            triggerStatus = True
        elif not ifValidStatus and checkifActive == 0:
            pass 
            setRuleTriggerStatus(ruleID,1)    
        else:
            pass
        logger.debug("Rule ID %d %s" % (ruleID, str(ifValidStatus)))
        return triggerStatus    


def validateAnd(ruleData):
    return True


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

