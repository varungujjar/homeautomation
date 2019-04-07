import json
from flask import Flask, render_template, request
from flask_socketio import SocketIO
import threading
import eventlet  

eventlet.monkey_patch()  



async_mode = None
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, message_queue='redis://')


@socketio.on('my_event')
def test_message(message):
    print(message)

@socketio.on('connect')
def test_connect():
    socketio.emit('message', str({'data': 'Connected2'}))
    #yes


@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)

    
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug='true')
