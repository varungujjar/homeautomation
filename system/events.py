import os, sys
sys.path.append('../')
import json
import asyncio
import time
from helpers.logger import formatLogger
import socketio
from datetime import datetime, timedelta, tzinfo
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
        getDevice = dbGetDevice(None,None,id)
        external_sio.emit('message', str(getDevice["properties"]))

    logger.debug("Rule Check Started")
    getRules = dbGetAutomationRules()
    for ruleData in getRules:
        validateIfCondition = validateIf(ruleData)
        validateAndCondition = validateAnd(ruleData)
        if validateIfCondition and validateAndCondition:
            loop = asyncio.get_event_loop()
            loop.create_task(doThen(ruleData))
            
    now = datetime.datetime.now()
    logger.debug("Rule Check Completed")
    
 

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
        getDeviceProperties = getDevice["properties"]

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
            logger.warning("Device with %s Not Found" % str(ifDataJson["device"])) 

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
        logger.warning("No Valid Handlers Found for Rule")

    if conditionStatus and checkifActive == 1:
        setAutomationTriggerStatus(ruleID,0)
        status = True
    elif not conditionStatus and checkifActive == 0:
        pass 
        setAutomationTriggerStatus(ruleID,1)    
    else:
        pass
    logger.debug("Rule ID %d %s" % (ruleID, str(status)))
    return status    


def validateAnd(ruleData):
    return True


async def doThen(ruleData):
    thenDataJson = json.loads(ruleData["then"])
    checkifActive = ruleData["trigger"]
    ruleID = ruleData["id"]

    if "device" in thenDataJson:
        getDevice = dbGetDevice(None,None,thenDataJson["device"])
        getDeviceProperties = getDevice["properties"]
        getDeviceActions = getDevice["actions"]
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
                    logger.info("Rule Triggered") 
            except ImportError as error:
                logger.error("%s" % str(error)) 
            except Exception as exception:
                logger.error("%s" % str(exception))

        dbInsertHistory(ruleID,"Rule","rule","system","triggered",0)


# if __name__ == '__main__':
#     sched = AsyncIOScheduler()
#     sched.add_job(eventsHandler, "interval", seconds=TIMER)
#     sched.start()
#     try:
#         asyncio.get_event_loop().run_forever()
#     except (KeyboardInterrupt, SystemExit):
#         loop.close()

    
