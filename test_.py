import asyncio
from aiohttp import web
import socketio
import json
from helpers.db import *
from components.horizon.server import *

mgr = socketio.AsyncRedisManager('redis://')
sio = socketio.AsyncServer(client_manager=mgr,async_mode='aiohttp')
app = web.Application()
sio.attach(app)

async def index(request):
    with open('test.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

async def getRoom(request):
    print("Rooms")
    response_obj = { 'rooms' : 'data' }
    return web.Response(text=json.dumps(response_obj), status=200)

async def getDevice(request):
    print("Device")
    response_obj = { 'device' : 'data' }
    return web.Response(text=json.dumps(response_obj), status=200)

async def getAutomation(request):
    print("Automation")
    response_obj = { 'automation' : 'data' }
    return web.Response(text=json.dumps(response_obj), status=200)

async def getSettings(request):
    print("Settings")
    response_obj = { 'settings' : 'data' }
    return web.Response(text=json.dumps(response_obj), status=200)


@sio.on('connect')
async def connect(sid, environ):
    await sio.emit('message', str({'data': 'Connected2'}))

@sio.on('disconnect')
def disconnect(sid):
    print('disconnect ', sid)


@sio.on('message')
async def on_message(sid, data):
    print(data)

app.router.add_static('/static', 'static')
app.router.add_get('/', index)
app.router.add_get('/room', getRoom)
app.router.add_get('/device', getDevice)
app.router.add_get('/automation', getAutomation)
app.router.add_get('/settings', getSettings)

def run_app(self):
        loop = self.loop
        app = loop.run_until_complete(self.create_app())
        app.on_startup.append(self.start_background_tasks)
        app.on_cleanup.append(self.cleanup_background_tasks)
        web.run_app(app, host=self.host, port=self.port)


if __name__ == '__main__':
    web.run_app(app,host='0.0.0.0', port=8000)