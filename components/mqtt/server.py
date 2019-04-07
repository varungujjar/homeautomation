import paho.mqtt.client as mqtt
import os, sys, json

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
    mqttHandler(msg.topic, msg.payload)


def on_publish(client,userdata,result):             #create function for callback
    print("Data published")


def json_validator(data):
    try:
        json.loads(data)
        return True
    except ValueError as error:
        print("invalid json: %s" % error)
        return False    


def mqttHandler(topic, payload):
    mqttPayload = json.loads(str(payload.decode()))
    for key, value in mqttPayload.items():
        if key in SUPPORTED_HEADERS:
            if value in SUPPORTED_DEVICES:
                importDevice = __import__(value)
                importDeviceClass = getattr(importDevice, value)
                deviceClass = importDeviceClass()    
                deviceClass.deviceHandler(topic,payload)    
                try:
                   pass
                except ImportError as error:
                    print(error)
                except Exception as exception:
                    print(exception)
            else:
                print("[MQTT] Server Device Not Supported")       
        else:
            pass


client.on_connect = on_connect
client.on_message = on_message


def mqttPublish(topic, value):
    client = mqtt.Client()
    client.connect("localhost", 1883, 60)
    client.publish(topic,value,qos=1, retain=False) 


if __name__ == "__main__":
    client.loop_forever()

