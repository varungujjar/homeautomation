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

# from components.mqtt import *
# from components.zigbee import *
from components.horizon import *
from components.datetime import *

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
        mode = self.mode
        if mode is not 1:
            logger.info("Starting Background Processes")
            path = "./"+COMPONENTS_DIR
            componentsList = self.getList(path)
            for component in componentsList:
                fileList = os.listdir(path+"/"+component)
                # if "server.py" in fileList:
                #     buildComponentPath = COMPONENTS_DIR+"."+component+".server"
                #     sys.path.append(path+"/"+component)
                #     importModule = __import__(buildComponentPath, fromlist="*")
                #     functionCall = getattr(importModule, "%sHandler" % component)()
                #     app.loop.create_task(functionCall)
        # app.loop.create_task(mqttHandler())
        # app.loop.create_task(zigbeeHandler())              
        app.loop.create_task(horizonHandler())
        app.loop.create_task(datetimeHandler())            
        app.loop.create_task(eventsHandlerTimer())
        app.loop.create_task(statusHandler())


    # async def cleanBackgroundProcesses(self, app):
    #     logger.info("Cancelling All Tasks")
    #     mode = self.mode
    #     if mode is not 1:
    #         logger.info("Closing Serial Connection")
    #         from components.zigbee import closeSerialConnection
    #         closeSerialConnection()
    #     # sio.disconnect()
    #     # await sio.disconnect()
    #     pending = asyncio.Task.all_tasks()
    #     for task in pending:
    #         task.cancel()
    #         await task
    #     # self.close()
    #     self.loop.remove_signal_handler(signal.SIGINT)
    #     self.loop.remove_signal_handler(signal.SIGTERM)
    #     self.loop.add_signal_handler(signal.SIGTERM,self.shutdownHandler)
    #     os.kill(os.getpid(), signal.SIGTERM)
       

    async def stopHandler(self):
        mode = self.mode
        if mode is not 1:
            logger.info("Closing Serial Connection")
            from components.zigbee import closeSerialConnection
            closeSerialConnection()
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
