import asyncio
from aiohttp import web
import socketio

mgr = socketio.AsyncRedisManager('redis://')
sio = socketio.AsyncServer(client_manager=mgr,async_mode='aiohttp')
app = web.Application()
sio.attach(app)

async def index(request):
    with open('test.html') as f:
        return web.Response(text=f.read(), content_type='text/html')


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

if __name__ == '__main__':
    web.run_app(app,host='0.0.0.0', port=8000)