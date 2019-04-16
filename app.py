import asyncio
from concurrent.futures import ThreadPoolExecutor
from random import choice
from functools import partial
from threading import Thread

from aiohttp import web, ClientSession, ClientError
import requests
import logging
import socketio
import signal
import functools
import threading
from system.events import *
from components.zigbee.server2 import *

COMPONENTS_DIR = "components"

logger = logging.getLogger(__name__)
logger.propagate = True
logging.basicConfig(level=logging.INFO,format='%(asctime)s %(levelname)s %(message)s')
# logging.basicConfig(level=logging.DEBUG,format='%(asctime)s %(levelname)s %(message)s',filename='/tmp/myapp.log',filemode='w')


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
                app.loop.create_task(importModule.serverHandler())
        app.loop.create_task(eventsHandlerTimer())
        

    async def stopHandler(self):
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


    async def createApp(self):
        app = web.Application()
        sio.attach(app)   
        app.router.add_get('/', self.index)
        return app

    def start_loop(self,loop2):
        loop2.create_task(xbeeserverHandler())
        # loop2.run_forever()

    def runApp(self):
        loop = self.loop 
        app = loop.run_until_complete(self.createApp())
        app.on_startup.append(self.startBackgroundProcesses)

        loop2 = asyncio.new_event_loop()    
        t = Thread(target=self.start_loop, args=(loop2,))
        t.start()
        # app.on_shutdown.append(self.shutdown)
        # app.on_cleanup.append(self.cleanupBackgroundProcesses)
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, lambda: asyncio.ensure_future(self.stopHandler()))
        web.run_app(app, host=self.host, port=self.port, handle_signals=False) 
 
        
           

if __name__ == '__main__':
    s = RunServer(host='0.0.0.0', port=8000)
    s.runApp()
