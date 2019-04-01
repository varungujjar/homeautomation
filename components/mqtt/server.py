import paho.mqtt.client as mqtt
import os, sys, json
sys.dont_write_bytecode = True

COMPONENT = "mqtt" 
SUPPORTED_HEADERS = {"class"}
SUPPORTED_DEVICES = {"switch","light"}

client = mqtt.Client()
client.connect("localhost", 1883, 60)

def on_connect(client, userdata, flags, rc):
    print("MQTT Connected with result code "+str(rc))
    client.subscribe("#")

def on_message(client, userdata, msg):
    #print(msg.payload)
    mqttHandler(str(msg.topic), str(msg.payload))

def json_validator(data):
    try:
        json.loads(data)
        return True
    except ValueError as error:
        print("invalid json: %s" % error)
        return False    

def mqttHandler(topic, payload):
    mqttPayload = json.loads(payload)
    for key, value in mqttPayload.iteritems():
        if key in SUPPORTED_HEADERS:
            if value in SUPPORTED_DEVICES:
                try:
                    importDevice = __import__(value)
                    importDeviceClass = getattr(importDevice, value)
                    deviceClass = importDeviceClass()    
                    deviceClass.deviceHandler(topic,payload)
                except ImportError:
                    print("[MQTT] Error Importing Device")
                    #que_notification(platform,'error','Could not find platform enumerator')
                    pass
            else:
                print("[MQTT] Server Device Not Supported")       
        else:
            pass


client.on_connect = on_connect
client.on_message = on_message
client.loop_forever()

