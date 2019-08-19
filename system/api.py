import asyncio, json
from aiohttp import web, ClientSession, ClientError
from system.system import *
from helpers.db import *
from system.piwifi import *
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
        if(request.method=="GET"):
            if "command" in request.match_info:
                if request.match_info['command'] == "read":
                    response = dbGetTable("notifications",{"read":int(request.match_info['data'])})
            else:           
                response = dbGetTable("notifications")
        elif(request.method=="POST"):
            print(request.match_info)
            if "command" in request.match_info:
                if request.match_info['command'] == "delete":
                    if await request.json() == 1:
                        response = dbDelete("notifications")                
                elif request.match_info['command'] == "read":
                    read = await request.json()
                    response = dbStore("notifications",{"id":request.match_info['id'],"read":read})
        return web.json_response(response)



    async def apiComponents(self,request):
        response = False
        if(request.method=="GET"):
            if "command" in request.match_info:
                if request.match_info['command'] == "system":
                    response = dbGetTable("components",{"system":int(request.match_info['data']),"enable":1})
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
                        if dbStore("components",{"id":request.match_info["id"],"enable":await request.json()}):
                            response = dbGetTable("components",{"id":request.match_info['id']})
                    elif request.match_info["command"] == "delete":
                        if int(await request.json()) == 1:
                            if dbDelete("components",int(request.match_info["id"])):
                                response = dbGetTable("components")
                    elif request.match_info["command"] == "save":
                        formData = await request.json()
                        response = dbStore("components",formData)
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
        response = False
        if(request.method=="GET"):
            if "type" in request.match_info:
                if request.match_info["type"] == "wifi":
                    if request.match_info["command"] == "scan":
                        content_wlist = wifiscan(interface='wlan0')
                        response_wlist = wifiparse(content_wlist)
                        content_status = wifistatus()
                        response_status = wifistatusparse(content_status)   
                        wifi_scan_list = []
                        for witem in response_wlist:
                            if witem["essid"] == response_status["essid"]:
                                wifi_scan_list.append(response_status)
                            else:
                                wifi_scan_list.append(witem)
                        response = wifi_scan_list        
                    elif request.match_info["command"] == "status":
                        content = wifistatus()
                        response = wifistatusparse(content)
                    elif request.match_info["command"] == "ping":
                        response = pingrouter()   
            else:        
                response = systemHandler()
        elif(request.method=="POST"):
            if "type" in request.match_info:
                if request.match_info["type"] == "wifi":
                    if request.match_info["command"] == "set":
                        formData = await request.json()
                        create_wpa_supplicant(formData["ssid_name"], formData["ssid_key"])
                        response = True

        return web.json_response(response)



    def Routers(self,app):
        #Rooms API
        app.router.add_get('/api/rooms', self.apiRooms)
        app.router.add_get('/api/rooms/{id}', self.apiRooms)
        app.router.add_post('/api/rooms/{id}/{command}', self.apiRooms)  #eg. rooms/90/save => accepts json
        
        #System Info API
        app.router.add_get('/api/system', self.apiSystem)
        app.router.add_get('/api/system/{type}/{command}', self.apiSystem)
        app.router.add_post('/api/system/{type}/{command}', self.apiSystem)  #eg. wifi/set => accepts json

        #Devices API
        app.router.add_get('/api/devices', self.apiDevices)
        app.router.add_get('/api/devices/{id}', self.apiDevices)
        app.router.add_post('/api/devices/{id}/{command}', self.apiDevices)  #eg. 89/action => {"brightness":100} accepts Json
            
        #Notifications API
        app.router.add_get('/api/notifications', self.apiNotifications)
        app.router.add_get('/api/notifications/{command}/{data}', self.apiNotifications)
        app.router.add_post('/api/notifications/{command}', self.apiNotifications) #eg. notifications/delete => 1 accepts Json
        app.router.add_post('/api/notifications/{id}/{command}', self.apiNotifications)  #eg. 5/read accepts Json
        
        #Rules API
        app.router.add_get('/api/rules', self.apiRules)    
        app.router.add_get('/api/rules/{id}', self.apiRules)
        app.router.add_post('/api/rules/{id}/{command}', self.apiRules)  #eg. 90/save accepts Json  
        
        #Component API
        app.router.add_get('/api/components', self.apiComponents)
        app.router.add_get('/api/components/{id}', self.apiComponents)
        app.router.add_get('/api/components/{command}/{data}', self.apiComponents)  # eg. components/system/0
        app.router.add_post('/api/components/{id}/{command}', self.apiComponents)  # eg. components/system/0
        

