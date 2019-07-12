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
    dbSyncDevice("datedaytime",{},{},"","system")
    if id:
        getDevice = dbGetDevice(None,None,None,id)
        external_sio.emit('message', str(getDevice["properties"]))

    logger.debug("Rule Check Started")
    getRules = dbGetTable("rules",None,1)

    for ruleData in getRules:
        validateIfCondition = validateIf(ruleData)
        # validateAndCondition = validateAnd(ruleData)
        # if validateIfCondition and validateAndCondition:
        #     loop = asyncio.get_event_loop()
        #     loop.create_task(doThen(ruleData))
            
    logger.debug("Rule Check Completed")
    
 

def validateIf(ruleData):
    ruleDataJson = ruleData["rule_if"]
    checkifActive = ruleData["trigger"]
    ruleID = ruleData["id"]
    ifValidStatus = False
    
    
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
                    # sys.path.insert(0, addSystemPath)
                    sys.path.append(addSystemPath) 
                    importModule = __import__(buildComponentPath, fromlist=getDeviceModule)
                    importDeviceClass = getattr(importModule, getDeviceClass)
                    deviceClass = importDeviceClass()
                    ifValidStatus = deviceClass.validateProperties(deviceId,conditionProperties,conditionType)
                    if ifValidStatus:
                        logger.info("----------Properties Valid") 
                except ImportError as error:
                    logger.error("%s" % str(error)) 
                except Exception as exception:
                    logger.error("%s" % str(exception))
                    
            else:
                logger.error("Device with %s Not Found" % str(deviceId))
                pass             

                

        #     getDeviceProperties = getDevice["properties"]
        #     getDevicePropertiesKeys = []

        #     for key, value in getDeviceProperties.items():
        #         getDevicePropertiesKeys.append(key)    

        #     if getDevice["type"]!= "datetime":
        #         for key, value in ifProperties.items():
        #             if key in getDevicePropertiesKeys:
        #                 if isinstance(value,dict):
        #                     for k, v in value.items():
        #                         getDeviceProperty= getDeviceProperties[key][k]
        #                         getIfProperty = ifProperties[key][k]
        #                 else:
        #                     getDeviceProperty = getDeviceProperties[key]
        #                     getIfProperty = ifProperties[key]
                            
        #                 if ifType == "=":
        #                     if getDeviceProperty == getIfProperty:
        #                         conditionStatus = True

        #                 elif ifType == ">":
        #                     if getDeviceProperty > getIfProperty:
        #                         conditionStatus = True

        #                 elif ifType == "<":
        #                     if getDeviceProperty < getIfProperty:
        #                         conditionStatus = True
                                     


        # else:
        #     logger.warning("No Valid Handlers Found for Rule")

        # if conditionStatus and checkifActive == 1:
        #     setRuleTriggerStatus(ruleID,0)
        #     status = True
        # elif not conditionStatus and checkifActive == 0:
        #     pass 
        #     setRuleTriggerStatus(ruleID,1)    
        # else:
        #     pass
        # logger.debug("Rule ID %d %s" % (ruleID, str(status)))
        # return status    


def validateAnd(ruleData):
    return True


async def doThen(ruleData):
    thenDataJson = ruleData["rule_then"]
    checkifActive = ruleData["trigger"]
    ruleID = ruleData["id"]
    ruleIDStr = str(ruleData["id"])

    if "type" in thenDataJson:
        getDevice = dbGetDevice(None,None,None,thenDataJson["id"])
        getDeviceProperties = getDevice["properties"]
        getDeviceActions = getDevice["actions"]
        thenActions = thenDataJson["properties"]

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
                status = deviceClass.triggerAction(thenActions,getDevice["id"])
                if status:
                    logger.info("Rule Triggered") 
            except ImportError as error:
                logger.error("%s" % str(error)) 
            except Exception as exception:
                logger.error("%s" % str(exception))

        dbInsertHistory("info","system",None,"Rule "+ruleIDStr,"Triggered",1)


# if __name__ == '__main__':
#     sched = AsyncIOScheduler()
#     sched.add_job(eventsHandler, "interval", seconds=TIMER)
#     sched.start()
#     try:
#         asyncio.get_event_loop().run_forever()
#     except (KeyboardInterrupt, SystemExit):
#         loop.close()

    #  UPDATE_EVERY = 1
# if __name__ == '__main__':
#     logger.info("[TIMER] Timer Running")
#     sched = BlockingScheduler()
#     sched.add_job(eventsHandler, "interval", seconds=UPDATE_EVERY)
#     sched.start() 
