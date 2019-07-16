import asyncio, json
from aiohttp import web, ClientSession, ClientError
from system.system import *
from helpers.db import *

COMPONENTS_DIR = "components"

class Api:
    def __init__(self):
        self.loop = asyncio.get_event_loop()


    async def getRules(self,request):
        if "id" in request.query:
            id = int(request.query["id"])
            if "published" in request.query:
                published = int(request.query["published"])
                if dbPublished("rules",id,published)==True:
                    response = dbGetTable("rules",id)
                else:
                    response = {"status":"error"}
            elif "delete" in request.query:
                if dbDelete("rules",id)==True:
                    response = dbGetTable("rules")
                else:
                    response = {"status":"error"}
            elif "save" in request.query:
                if dbDelete("rules",id)==True:
                    response = dbGetTable("rules")
                else:
                    response = {"status":"error"}        
            else:        
                response = dbGetTable("rules",id)       
        else:           
            response = dbGetTable("rules")
        return web.json_response(response)



    async def postRules(self,request):
        formData = await request.json()
        dbStoreRule(formData)
        return web.json_response({})



    async def getNotifications(self,request):
        action = None
        if "action" in request.query:
            action = request.query["action"]
            if action == "clear":
                dbDelete("notifications",None)
        notifications = dbGetTable("notifications",None,None,"created")
        return web.json_response(notifications)


    async def getComponents(self,request):
        if "id" in request.query:
            id = str(request.query["id"])
            response = dbGetComponent(id)
        elif "system" in request.query:
            system = int(request.query["system"])
            response = dbGetTable("components",None,None,None,system)          
        else:           
            response = dbGetTable("components")
        return web.json_response(response)
        

    async def getRooms(self,request):
        if "id" in request.query:
            id = int(request.query["id"])
            response = dbGetTable("rooms",id)
        else:
            response = dbGetTable("rooms")
        return web.json_response(response)


    async def getDevices(self,request):
        if "id" in request.query:
            id = int(request.query["id"])
            devices = dbGetDevice(None,None,None,id)
        else:
            devices = dbGetDevices()
        return web.json_response(devices)
    


    async def getSystem(self,request):
        system = systemHandler()
        return web.json_response(system)


    async def setDevice(self,request):
        requestParams = await request.json()
        deviceId = requestParams["device"]
        deviceAction = requestParams["actions"] 
        getDevice = dbGetDevice(None,None,None,deviceId)
        getDeviceProperties = getDevice["properties"]
        getDeviceActions = getDevice["actions"]
        if getDevice:
            getDeviceModule = str(getDevice["type"])
            getDeviceClass = str(getDevice["type"])
            getDeviceComponent = str(getDevice["component"])
            try:
                buildComponentPath = COMPONENTS_DIR+"."+getDeviceComponent+"."+getDeviceModule
                importModule = __import__(buildComponentPath, fromlist=getDeviceModule)
                importDeviceClass = getattr(importModule, getDeviceClass)
                deviceClass = importDeviceClass()
                status = deviceClass.triggerAction(getDevice, deviceAction)
                if status:
                    logger.info("Action Triggered") 
                    response_obj = { 'status' : 'success' }
                    return web.json_response(response_obj)
            except ImportError as error:
                logger.error("%s" % str(error)) 
                return web.json_response(str(error))
            except Exception as exception:
                logger.error("%s" % str(exception))
                return web.json_response(str(exception))


    def Routers(self,app):
        app.router.add_get('/api/rooms', self.getRooms)
        app.router.add_get('/api/devices', self.getDevices)

        app.router.add_get('/api/system', self.getSystem)
        app.router.add_post('/api/device', self.setDevice)

        app.router.add_get('/api/rules', self.getRules)
        app.router.add_post('/api/rules', self.postRules)

        app.router.add_get('/api/notifications', self.getNotifications)
        app.router.add_get('/api/components', self.getComponents)

