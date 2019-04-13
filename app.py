import asyncio
from collections import deque
from concurrent.futures import ThreadPoolExecutor
from random import choice
from aiohttp import web, ClientSession, ClientError
import requests
import logging
# import system.colorlog
import socketio

from components.horizon.server import *
from components.system.server import *
from components.mqtt.server import *
from components.zigbee.server import *
from system.events import *

sys.path.append('/home/pi/components/mqtt/')
sys.path.append('/home/pi/components/zigbee/')


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
 
 
class ScraperServer:
 
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
 
    def scrape_callback(self, return_value):
        return_value = return_value.result()
        if return_value:
            self.data_to_save.append(return_value)
 
    async def start_background_tasks(self, app):
        logger.info("Starting Background Tasks")
        app['horizon_sever'] = app.loop.create_task(horizonHandler())
        app['device_server'] = app.loop.create_task(deviceHandler())
        app['events_server'] = app.loop.create_task(eventsHandlerCheck())
        app['mqtt_server'] = app.loop.create_task(mqttHandler())
        app['xbee_server'] = app.loop.create_task(xbeePoll())
 

    async def cleanup_background_tasks(self, app):
        app['horizon_sever'].cancel()
        app['device_server'].cancel()
        app['events_server'].cancel()
        app['mqtt_server'].cancel()
        await app['horizon_sever']
        await app['device_server']
        await app['events_server']
        await app['mqtt_server']
 

    async def create_app(self):
        app = web.Application()
        sio.attach(app)
        app.router.add_get('/', self.index)
        return app


    def run_app(self):
        loop = self.loop
        app = loop.run_until_complete(self.create_app())
        app.on_startup.append(self.start_background_tasks)
        # app.on_cleanup.append(self.cleanup_background_tasks)
        web.run_app(app, host=self.host, port=self.port)
 
 
if __name__ == '__main__':
    s = ScraperServer(host='0.0.0.0', port=8000)
    s.run_app()