import asyncio, json
from aiohttp import web, ClientSession, ClientError
from system.system import *
from helpers.db import *

COMPONENTS_DIR = "components"

class Api:
    def __init__(self):
        self.loop = asyncio.get_event_loop()


    async def apiRules(self,request):
        response = False
        if(request.method=="GET"):
            if "id" in request.match_info:
                if request.match_info['id']:
                    response = dbGetTable("rules",int(request.match_info['id']))
            else:           
                response = dbGetTable("rules")
        elif(request.method=="POST"):
            if "id" in request.match_info:
                if "command" in request.match_info:
                    if request.match_info["command"] == "published":
                        if dbPublished("rules",int(request.match_info["id"]),request.match_info["data"]):
                            response = dbGetTable("rules",int(request.match_info["id"]))
                    elif request.match_info["command"] == "delete":
                        if int(request.match_info["data"]) == 1:
                            if dbDelete("rules",int(request.match_info["id"])):
                                response = dbGetTable("rules")
                    elif request.match_info["command"] == "save":
                        formData = await request.json()
                        if dbStoreRule(formData):
                            response = True
        return web.json_response(response)



    async def apiDevices(self,request):
        response = False
        if(request.method=="GET"):
            if "id" in request.match_info:
                if request.match_info['id']:
                    response = dbGetDevice(None,None,None,int(request.match_info['id']))
            else:           
                response = dbGetDevices()
        elif(request.method=="POST"):
            if "id" in request.match_info:
                if "command" in request.match_info:
                    if request.match_info["command"] == "published":
                        if dbPublished("rules",int(request.match_info["id"]),request.match_info["data"]):
                            response = dbGetTable("rules",int(request.match_info["id"]))
                    elif request.match_info["command"] == "delete":
                        if int(request.match_info["data"]) == 1:
                            if dbDelete("rules",int(request.match_info["id"])):
                                response = dbGetTable("rules")
                    elif request.match_info["command"] == "save":
                        formData = await request.json()
                        if dbStoreRule(formData):
                            response = True
        return web.json_response(response)



    async def apiNotifications(self,request):
        response = False
        if "command" in request.match_info:
            if request.match_info['command'] == "delete":
                data = int(request.match_info['data'])
                if data == 1:
                    response = dbDelete("notifications")
        else:           
            response = dbGetTable("notifications",None,None,"created")
        return web.json_response(response)



    async def apiComponents(self,request):
        response = False
        if "command" in request.match_info:
            if request.match_info['command'] == "system":
                id = int(request.match_info['data'])
                response = dbGetTable("components",None,None,None,int(id))
        elif "id" in request.match_info:
            response = dbGetTable("components",str(request.match_info['id']))        
        else:           
            response = dbGetTable("components")
        return web.json_response(response)
        


    async def apiRooms(self,request):
        if "id" in request.query:
            id = int(request.query["id"])
            response = dbGetTable("rooms",int(id))
        else:
            response = dbGetTable("rooms")
        return web.json_response(response)



    async def apiSystem(self,request):
        system = systemHandler()
        return web.json_response(system)



    async def apiDevice(self,request):
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
        #Rooms API
        app.router.add_get('/api/rooms', self.apiRooms)
        app.router.add_get('/api/rooms/{command}/{data}', self.apiRooms)
        
        #System Info API
        app.router.add_get('/api/system', self.apiSystem)

        #Devices API
        app.router.add_get('/api/devices', self.apiDevices)
        app.router.add_get('/api/devices/{id}', self.apiDevices)
        # app.router.add_get('/api/devices/{id}/{command}/{data}', self.apiDevices)  #eg. 89/properties/current
        app.router.add_get('/api/devices/{command}/{data}', self.apiDevices)   #eg. 89/online/1
        app.router.add_post('/api/device/{id}/{command}/{data}', self.apiDevices)  #eg. 89/brightness/100
            
        #Notifications API
        app.router.add_get('/api/notifications', self.apiNotifications)
        app.router.add_get('/api/notifications/{command}/{data}', self.apiNotifications)
        
        #Rules API
        app.router.add_get('/api/rules', self.apiRules)    
        app.router.add_get('/api/rules/{id}', self.apiRules)
        app.router.add_post('/api/rules/{id}/{command}', self.apiRules)  #eg. 90/save
        app.router.add_post('/api/rules/{id}/{command}/{data}', self.apiRules)  # eg. 90/published/0
        
        #Component API
        app.router.add_get('/api/components', self.apiComponents)
        app.router.add_get('/api/components/{id}', self.apiComponents)
        app.router.add_get('/api/components/{command}/{data}', self.apiComponents)  # eg. components/system/0
        

