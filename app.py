import asyncio, json
from concurrent.futures import ThreadPoolExecutor
from random import choice
from functools import partial
from threading import Thread
from aiohttp import web, ClientSession, ClientError
import requests
from helpers.logger import formatLogger
import socketio
import signal
import functools
import threading
from system.events import *
from system.status import *
from helpers.db import *
from components.zigbee.server import closeSerialConnection
from components.system.system import *

COMPONENTS_DIR = "components"

# logging.basicConfig(level=logging.INFO,format='[%(levelname)s] [%(name)s] => %(funcName)s : %(asctime)s : %(message)s',datefmt='%a %Y-%m-%d %H:%M:%S',)
# logging.basicConfig(level=logging.DEBUG,format='%(asctime)s %(levelname)s %(message)s',filename='/tmp/myapp.log',filemode='w')

logger = formatLogger(__name__)

mgr = socketio.AsyncRedisManager('redis://')
sio = socketio.AsyncServer(client_manager=mgr,async_mode='aiohttp')

 
async def post_request(url, json, proxy=None):
    async with ClientSession() as client:
        try:
            async with client.post(url, json=json, proxy=proxy, timeout=60) as response:
                html = await response.text()
                return {'html': html, 'status': response.status}
        except ClientError as err:
            return {'error': err}
 
def get_request(url):
    try:
        res = requests.get(url)
        return {'html': res.text, 'status': res.status_code, 'url': res.url, 'original_url': url}
    except requests.RequestException:
        return
 
 
class RunServer:
 
    def __init__(self, host, port):
 
        self.host = host
        self.port = port
        self.pool = ThreadPoolExecutor(max_workers=20)
        self.loop = asyncio.get_event_loop()


    async def index(self,request):
        with open('test.html') as f:
            return web.Response(text=f.read(), content_type='text/html')    
 
    async def get_urls(self, request):
        data = await request.json()
        url = data.get('url')
        if url:
            t = self.loop.run_in_executor(self.pool, get_request, url)
            t.add_done_callback(self.scrape_callback)
        return web.json_response({'Status': 'Dispatched'})
    

    def getList(self, path):
        folderList = [d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]
        dirList = []
        ignorelist = {"__pycache__"}
        for folderItem in folderList:
            if folderItem not in ignorelist:
                dirList.append(folderItem)
        return dirList


    def runTaskList(self, path):
        componentsList = getList(path)
        for component in componentsList:
            fileList = os.listdir(path+"/"+component)
            if "server.py" in fileList:
                print(component)


    async def startBackgroundProcesses(self, app):
        logger.info("Starting Background Processes")
        path = "./"+COMPONENTS_DIR
        componentsList = self.getList(path)
        for component in componentsList:
            fileList = os.listdir(path+"/"+component)
            if "server.py" in fileList:
                buildComponentPath = COMPONENTS_DIR+"."+component+".server"
                sys.path.append(path+"/"+component)
                importModule = __import__(buildComponentPath, fromlist="*")
                functionCall = getattr(importModule, "%sHandler" % component)()
                app.loop.create_task(functionCall)
        app.loop.create_task(eventsHandlerTimer())
        app.loop.create_task(statusHandler())
        

    async def stopHandler(self):
        logger.info("Closing Serial Connection")
        closeSerialConnection()
        logger.info("Please Wait.Shutting Down")
        logger.info("Cancelling All Tasks...")
        pending = asyncio.Task.all_tasks()
        for task in pending:
            task.cancel()
        self.loop.remove_signal_handler(signal.SIGINT)
        self.loop.remove_signal_handler(signal.SIGTERM)
        self.loop.add_signal_handler(signal.SIGTERM, self.shutdownHandler)
        os.kill(os.getpid(), signal.SIGTERM)


    def shutdownHandler(self):
        logger.info("Server Down.Goodbye")
        self.loop.remove_signal_handler(signal.SIGTERM)
        raise web.GracefulExit()


    async def getRooms(self,request):
        rooms = dbGetDeviceRooms()
        return web.json_response(rooms)

    async def getDevices(self,request):
        devices = dbGetAllDevices(1)
        return web.json_response(devices)


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


    async def getWeather(self,request):
        sensors = dbGetWeatherSensor()
        return web.json_response(sensors)


    async def getHorizon(self,request):
        horizon = dbGetDevice("horizon","")
        return web.json_response(horizon)


    async def getSystem(self,request):
        system = systemHandler()
        return web.json_response(system)


    async def createApp(self):
        app = web.Application()
        sio.attach(app)   
        # app.router.add_get('/', self.index)
        app.router.add_get('/api/rooms', self.getRooms)
        app.router.add_get('/api/devices', self.getDevices)
        app.router.add_get('/api/weather', self.getWeather)
        app.router.add_get('/api/horizon', self.getHorizon)
        app.router.add_get('/api/system', self.getSystem)
        app.router.add_post('/api/device', self.setDevice)
        # app.router.add_get('/api/scenes', self.getDevices)
        # app.router.add_get('/api/automations', self.getDevices)
        # app.router.add_get('/api/components', self.getDevices)
        # app.router.add_get('/api/history', self.getDevices)
        return app


    @sio.on('connect')
    async def connect(self, data):
        dbInsertHistory("success","system",None,"Hi, there","I Am now connected.")
    

    def runApp(self):
        loop = self.loop 
        app = loop.run_until_complete(self.createApp())
        app.on_startup.append(self.startBackgroundProcesses)
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, lambda: asyncio.ensure_future(self.stopHandler()))
        web.run_app(app, host=self.host, port=self.port, handle_signals=False) 
 
        
if __name__ == '__main__':
    s = RunServer(host='0.0.0.0', port=8000)
    s.runApp()
