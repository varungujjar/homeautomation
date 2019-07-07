import asyncio, json
from aiohttp import web, ClientSession, ClientError
from system.system import *
from helpers.db import *

COMPONENTS_DIR = "components"

class Api:
    def __init__(self):
        self.loop = asyncio.get_event_loop()


    async def getRules(self,request):
        id = None
        active = None
        if "id" in request.query:
            id = int(request.query["id"])
            if "published" in request.query:
                published = int(request.query["published"])
                dbPublished("rules",id,published)
            rules = dbGetTable("rules",id)
        else:           
            rules = dbGetTable("rules",None)
        return web.json_response(rules)


    async def getRulesSave(self,request):
        formData = await request.json()
        dbStoreRule(formData)
        return web.json_response({})


    async def getNotifications(self,request):
        action = None
        if "action" in request.query:
            action = request.query["action"]
            if action == "clear":
                dbDeleteRecordsTable("notifications")
        notifications = dbGetTable("notifications",None,None,"created")
        return web.json_response(notifications)


    async def getComponents(self,request):
        components = dbGetTable("components",None)
        return web.json_response(components) 


    async def getRooms(self,request):
        id = None
        if "id" in request.query:
            id = int(request.query["id"])
        rooms = dbGetTable("rooms",id)
        return web.json_response(rooms)


    async def getDevices(self,request):
        id = None
        if "id" in request.query:
            id = int(request.query["id"])
            devices = dbGetDevice(None,None,id)
        else:    
            devices = dbGetAllDevices(0)
        return web.json_response(devices)
    

    async def getWeather(self,request):
        sensors = dbGetWeatherSensor()
        return web.json_response(sensors)


    async def getHorizon(self,request):
        horizon = dbGetDevice("horizon","")
        return web.json_response(horizon)


    async def getSystem(self,request):
        system = systemHandler()
        return web.json_response(system)


    async def setDevice(self,request):
        requestParams = await request.json()
        deviceId = requestParams["device"]
        deviceAction = requestParams["actions"] 
        getDevice = dbGetDevice(None,None,deviceId)
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
                status = deviceClass.triggerAction(deviceAction,getDevice["id"])
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
        app.router.add_get('/api/weather', self.getWeather)
        app.router.add_get('/api/horizon', self.getHorizon)
        app.router.add_get('/api/system', self.getSystem)
        app.router.add_post('/api/device', self.setDevice)
        app.router.add_get('/api/rules', self.getRules)
        app.router.add_post('/api/rules/save', self.getRulesSave)
        app.router.add_get('/api/notifications', self.getNotifications)
        app.router.add_get('/api/components', self.getDevices)

