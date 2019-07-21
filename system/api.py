import asyncio, json
from aiohttp import web, ClientSession, ClientError
from system.system import *
from helpers.db import *
#request headers aiohttp reference from here..
#https://aiohttp.readthedocs.io/en/v0.18.2/web_reference.html

COMPONENTS_DIR = "components"

class Api:
    def __init__(self):
        self.loop = asyncio.get_event_loop()


    async def apiRules(self,request):
        response = False
        if(request.method=="GET"):
            if "id" in request.match_info:
                if request.match_info['id']:
                    response = dbGetTable("rules",{"id":int(request.match_info['id'])})
            else:           
                response = dbGetTable("rules")
        elif(request.method=="POST"):
            if "id" in request.match_info:
                if "command" in request.match_info:
                    if request.match_info["command"] == "published":
                        if dbStore("rules",{"id":int(request.match_info["id"]),"published":await request.json()}):
                            response = dbGetTable("rules",{"id":int(request.match_info['id'])})
                    elif request.match_info["command"] == "delete":
                        if int(await request.json()) == 1:
                            if dbDelete("rules",int(request.match_info["id"])):
                                response = dbGetTable("rules")
                    elif request.match_info["command"] == "save":
                        formData = await request.json()
                        response = dbStore("rules",formData)
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
                    if request.match_info["command"] == "delete":
                        if int(request.match_info["data"]) == 1:
                            if dbDelete("devices",int(request.match_info["id"])):
                                response = dbGetTable("devices")
                    elif request.match_info["command"] == "save":
                        formData = await request.json()
                        response = dbStoreDevice(formData)
                    elif request.match_info["command"] == "action":
                        actionData = await request.json()
                        deviceId = int(request.match_info["id"])
                        getDevice = dbGetDevice(None,None,None,deviceId)
                        if getDevice:
                            getDeviceModule = str(getDevice["type"])
                            getDeviceClass = getDeviceModule
                            getDeviceComponent = str(getDevice["component"])
                            try:
                                buildComponentPath = "components."+getDeviceComponent+"."+getDeviceModule
                                addSystemPath = "../components/"+getDeviceComponent
                                sys.path.append(addSystemPath) 
                                importModule = __import__(buildComponentPath, fromlist=getDeviceModule)
                                importDeviceClass = getattr(importModule, getDeviceClass) #this is class that we calling
                                deviceClass = importDeviceClass()
                                triggerStatus = deviceClass.triggerAction(getDevice,actionData)
                                if triggerStatus:
                                    response = triggerStatus
                                    logger.info("Device %s Triggered" % str(deviceId))            
                            except ImportError as error:
                                logger.error("%s" % str(error)) 
                            except Exception as exception:
                                logger.error("%s" % str(exception)) 
                        else:
                            logger.error("Device with %s Not Found" % str(deviceId))
                            pass
        return web.json_response(response)



    async def apiNotifications(self,request):
        response = False
        if "command" in request.match_info:
            if request.match_info['command'] == "delete":
                if await request.json() == 1:
                    response = dbDelete("notifications")
        else:           
            response = dbGetTable("notifications")
        return web.json_response(response)



    async def apiComponents(self,request):
        response = False
        if(request.method=="GET"):
        if "command" in request.match_info:
            if request.match_info['command'] == "system":
                id = int(request.match_info['data'])
                response = dbGetTable("components",{"system":0})
            if request.match_info['command'] == "service":
                response = dbGetTable("components",{"service":1})    
        elif "id" in request.match_info:
            response = dbGetTable("components",{"id":str(request.match_info['id'])})        
        else:           
            response = dbGetTable("components")
        elif(request.method=="POST"):
            if "id" in request.match_info:
                if "command" in request.match_info:
                    if request.match_info["command"] == "enable":
                        if dbStore("components",{"id":int(request.match_info["id"]),"enable":await request.json()}):
                            response = dbGetTable("components",{"id":int(request.match_info['id'])})
                    elif request.match_info["command"] == "delete":
                        if int(await request.json()) == 1:
                            if dbDelete("rules",int(request.match_info["id"])):
                                response = dbGetTable("rules")
                    elif request.match_info["command"] == "save":
                        formData = await request.json()
                        response = dbStore("rules",formData)


        return web.json_response(response)
        


    async def apiRooms(self,request):
        response = False
        if(request.method=="GET"):
            if "id" in request.match_info:
                response = dbGetTable("rooms",{"id":str(request.match_info['id'])})        
            else:           
                response = dbGetTable("rooms")
        elif(request.method=="POST"):
            if "id" in request.match_info:
                if "command" in request.match_info:
                    if request.match_info["command"] == "delete":
                        if int(await request.json()) == 1:
                            if dbDelete("rooms",int(request.match_info["id"])):
                                response = dbGetTable("rooms")
                    elif request.match_info["command"] == "save":
                        formData = await request.json()
                        response = dbStore("rooms",formData)
        return web.json_response(response)



    async def apiSystem(self,request):
        system = systemHandler()
        return web.json_response(system)



    def Routers(self,app):
        #Rooms API
        app.router.add_get('/api/rooms', self.apiRooms)
        app.router.add_get('/api/rooms/{id}', self.apiRooms)
        app.router.add_post('/api/rooms/{id}/{command}', self.apiRules)  #eg. rooms/90/save => accepts json
        
        #System Info API
        app.router.add_get('/api/system', self.apiSystem)

        #Devices API
        app.router.add_get('/api/devices', self.apiDevices)
        app.router.add_get('/api/devices/{id}', self.apiDevices)
        app.router.add_post('/api/devices/{id}/{command}', self.apiDevices)  #eg. 89/action => {"brightness":100} accepts Json
            
        #Notifications API
        app.router.add_get('/api/notifications', self.apiNotifications)
        app.router.add_post('/api/notifications/{command}', self.apiNotifications) #eg. notifications/delete => 1 accepts Json
        
        #Rules API
        app.router.add_get('/api/rules', self.apiRules)    
        app.router.add_get('/api/rules/{id}', self.apiRules)
        app.router.add_post('/api/rules/{id}/{command}', self.apiRules)  #eg. 90/save accepts Json  
        
        #Component API
        app.router.add_get('/api/components', self.apiComponents)
        app.router.add_get('/api/components/{id}', self.apiComponents)
        app.router.add_get('/api/components/{command}/{data}', self.apiComponents)  # eg. components/system/0
        

