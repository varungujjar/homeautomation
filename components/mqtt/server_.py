import os, sys
import json
import logging
import paho.mqtt.client as mqtt

logger = logging.getLogger(__name__)
logger.propagate = True
logging.basicConfig(level=logging.DEBUG,format='%(asctime)s %(levelname)s %(message)s')

COMPONENT = "mqtt" 
SUPPORTED_HEADERS = {"class"}
SUPPORTED_DEVICES = {"switch","light"}

client = mqtt.Client()
client.connect("localhost", 1883, 60)
client.enable_logger(logger)



def on_connect(client, userdata, flags, rc):
    logger.info("[MQTT] Connected with result code %s" % str(rc))
    client.subscribe("#")
    logger.info("[MQTT] Subscribed to #")


def on_message(client, userdata, msg):
    #print(msg.payload)
    mqttHandler(msg.topic, msg.payload)


def on_publish(client,userdata,result):             #create function for callback
    logger.info("[MQTT] Message Published")


def mqttHandler(topic, payload):
    logger.info("[MQTT] %s => %s" % (topic, str(payload)))
    payload = str(payload.decode())
    mqttPayload = json.loads(payload)
    if isinstance(mqttPayload,dict):
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
                        logger.error("[MQTT] %s" % str(error))
                    except Exception as exception:
                        logger.error("[MQTT] %s" % str(exception))
                else:
                    logger.warning("[MQTT] Device Not Supported")      
            else:
                pass


def mqttPublish(topic, value):
    client = mqtt.Client()
    client.connect("localhost", 1883, 60)
    client.publish(topic,value,qos=1, retain=False) 

client.on_connect = on_connect
client.on_message = on_message    

if __name__ == "__main__":
    client.loop_forever()
    

