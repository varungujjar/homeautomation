import asyncio, json
from concurrent.futures import ThreadPoolExecutor
from threading import Thread
from aiohttp import web
import requests
from helpers.logger import formatLogger
import socketio
import sys
import signal
import time
from core.rules import *
from core.network.status import *
from core.system import *
from core.api import *
from components.eddystone import *
from core.agent.controller import *
# from matrix_lite import led


COMPONENTS_DIR = "components"
logger = formatLogger(__name__)

mgr = socketio.AsyncRedisManager('redis://')
sio = socketio.AsyncServer(client_manager=mgr, async_mode='aiohttp', cors_allowed_origins='*')


class RunServer:
    def __init__(self, host, port, mode):
        self.host = host
        self.port = port
        self.pool = ThreadPoolExecutor(max_workers=8)
        self.loop = asyncio.get_event_loop()
        self.api = Api()
        self.mode = mode


    def getList(self, path):
        folderList = [d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]
        dirList = []
        ignorelist = {"__pycache__"}
        for folderItem in folderList:
            if folderItem not in ignorelist:
                dirList.append(folderItem)
        return dirList


    async def startLeds(self):
        everloop = ['black'] * led.length
        everloop[0] = {'b':10,'r':0, 'g':0}
        while True:
            everloop.append(everloop.pop(0))
            led.set(everloop)
            await asyncio.sleep(0.050)

          


    async def startBackgroundProcesses(self, app):
        loop = asyncio.get_running_loop()
        getServices = dbGetTable("components",{"service":1})
        for service in getServices:
            if service["enable"] == 1:
                buildComponentPath = COMPONENTS_DIR+"."+service["id"]
                sys.path.append("./"+COMPONENTS_DIR+"/")
                importModule = __import__(buildComponentPath, fromlist="*")
                functionCall = getattr(importModule, "%sHandler" % service["id"])()
                loop.create_task(functionCall)
        loop.create_task(eventsHandlerTimer())  
        loop.create_task(networkHandler())
        loop.create_task(eddystoneHandler())   
        # loop.create_task(self.startLeds())   

  
        
        

    async def stopHandler(self):
        getService = dbGetTable("components",{"id":"xbee"})
        if getService["enable"] == 1:
            logger.info("Closing Serial Connection")
            buildComponentPath = COMPONENTS_DIR+"."+getService["id"]
            sys.path.append("./"+COMPONENTS_DIR+"/")
            importModule = __import__(buildComponentPath, fromlist="*")
            functionCall = getattr(importModule, "closeSerialConnection")()
        logger.info("Cancelling all Tasks")
        pending = asyncio.Task.all_tasks()
        print(pending)
        for task in pending:
            task.cancel()
        self.loop.stop()
        # self.loop.close()
        await sio.disconnect(0)    
        self.loop.remove_signal_handler(signal.SIGINT)
        self.loop.remove_signal_handler(signal.SIGTERM)
        os.kill(os.getpid(), signal.SIGKILL)
        


    async def createApp(self):
        app = web.Application()
        sio.attach(app)
        self.api.Routers(app)
        return app

    # @sio.event 
    # async def connect(sid, environ):
    #     message = { "author": "them", "type": "text", "data": { "text": "Hey There" } }
    #     await sio.emit('agent', message )


    def runApp(self):
        loop = self.loop
        app = loop.run_until_complete(self.createApp())
        app.on_startup.append(self.startBackgroundProcesses)
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, lambda: asyncio.ensure_future(self.stopHandler()))
        update_model()
        web.run_app(app, host=self.host, port=self.port, handle_signals=False) 
 
    
if __name__ == '__main__':
    s = RunServer(host='0.0.0.0', port=8000, mode=None)
    s.runApp()
