import paho.mqtt.client as mqtt
import os, sys
import json
from switch import *

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

COMPONENT = 'mqtt'

SUPPORTED_TYPES ={'app','ESPURNA'}

client = mqtt.Client()
client.connect("localhost", 1883, 60)

def on_connect(client, userdata, flags, rc):
    print("MQTT Connected with result code "+str(rc))
    client.subscribe("#")

def on_message(client, userdata, msg):
    mqtt_enumerate(str(msg.topic), str(msg.payload))


def mqtt_device_handler(data):
    pass



def json_validator(data):
    try:
        json.loads(data)
        return True
    except ValueError as error:
        print("invalid json: %s" % error)
        return False    

def mqtt_enumerate(topic, msg):
    #print(msg)
    #print(topic)
    #printer.deviceHandler(msg,topic)
    _dome = mqttSwitch(msg,topic)
    k = _dome.deviceHandler(msg,topic)
    #print(k)
    #l = _dome.deviceHandler(data, topic)

    #yo = printer.deviceHandler(msg,topic)
    #yo = mqttSwitch(data,topic).dome()
    #print(yo)  
    #return True



client.on_connect = on_connect
client.on_message = on_message
client.loop_forever()

