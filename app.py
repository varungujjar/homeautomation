import asyncio, json
from concurrent.futures import ThreadPoolExecutor
from random import choice
from functools import partial
from threading import Thread
from aiohttp import web, ClientSession, ClientError
import requests
from helpers.logger import formatLogger
import socketio
import sys
import signal
import functools
import threading
from system.rules import *
from system.notifications import *
from system.status import *
from system.system import *
from system.api import *

COMPONENTS_DIR = "components"
logger = formatLogger(__name__)

mgr = socketio.AsyncRedisManager('redis://')
sio = socketio.AsyncServer(client_manager=mgr,async_mode='aiohttp')


class RunServer:
    def __init__(self, host, port, mode):
        self.host = host
        self.port = port
        self.pool = ThreadPoolExecutor(max_workers=20)
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


    async def startBackgroundProcesses(self, app):
        getServices = dbGetTable("components",{"service":1})
        for service in getServices:
            if service["enable"] == 1:
                buildComponentPath = COMPONENTS_DIR+"."+service["id"]
                sys.path.append("./"+COMPONENTS_DIR+"/")
                importModule = __import__(buildComponentPath, fromlist="*")
                functionCall = getattr(importModule, "%sHandler" % service["id"])()
                app.loop.create_task(functionCall)
        app.loop.create_task(eventsHandlerTimer())
        app.loop.create_task(statusHandler())

       
    async def stopHandler(self):
        getService = dbGetTable("components",{"id":"zigbee"})
        if getService["enable"] == 1:
            logger.info("Closing Serial Connection")
            buildComponentPath = COMPONENTS_DIR+"."+getService["id"]
            sys.path.append("./"+COMPONENTS_DIR+"/")
            importModule = __import__(buildComponentPath, fromlist="*")
            functionCall = getattr(importModule, "closeSerialConnection")()
        logger.info("Cancelling All Tasks")
        pending = asyncio.Task.all_tasks()
        for task in pending:
            task.cancel()
        await sio.disconnect(0)    
        self.loop.remove_signal_handler(signal.SIGINT)
        self.loop.remove_signal_handler(signal.SIGTERM)
        self.loop.add_signal_handler(signal.SIGTERM, self.shutdownHandler)
        os.kill(os.getpid(), signal.SIGTERM)


    def shutdownHandler(self):
        logger.info("Server Down.Goodbye")
        self.loop.remove_signal_handler(signal.SIGTERM)
        raise web.GracefulExit()


    async def createApp(self):
        app = web.Application()
        sio.attach(app)
        self.api.Routers(app)
        return app


    @sio.on('connect',namespace='/')
    async def connect(self, sid):
        pushNotification("success","system","Hi, there","I Am now connected.")
    

    def runApp(self):
        loop = self.loop
        app = loop.run_until_complete(self.createApp())
        app.on_startup.append(self.startBackgroundProcesses)
        # app.on_cleanup.append(self.cleanBackgroundProcesses)
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, lambda: asyncio.ensure_future(self.stopHandler()))
        web.run_app(app, host=self.host, port=self.port, handle_signals=False) 
 
    
if __name__ == '__main__':
    arg = None
    if len(sys.argv) > 1:
        arg = int(sys.argv[1])
    s = RunServer(host='0.0.0.0', port=8000, mode=arg)
    s.runApp()
