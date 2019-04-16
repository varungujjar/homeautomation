import os, sys, json
from ast import literal_eval
import logging
import asyncio

COMPONENT = "mqtt" 
SUPPORTED_HEADERS = {"class"}
SUPPORTED_DEVICES = {"switch","light"}

from hbmqtt.client import MQTTClient, ClientException, ConnectException
from hbmqtt.mqtt.constants import QOS_1

logger = logging.getLogger(__name__)

config = {
    'keep_alive': 30,
    'ping_delay': 2,
    'default_qos': 1,
    'default_retain': False,
    'auto_reconnect': True,
    'reconnect_max_interval': 2,
    'reconnect_retries': 1800
}

C = MQTTClient(config=config)


@asyncio.coroutine
def serverHandler():
    yield from C.connect('mqtt://user:password@0.0.0.0:1883')
    yield from C.subscribe([('#', QOS_1)])
    logger.info("[MQTT] Subscribed to #")
    try:
        while True:
            message = yield from C.deliver_message()
            packet = message.publish_packet
            topic = packet.variable_header.topic_name
            payload = str(packet.payload.data.decode())
            mqttPayload = json.loads(payload)
            logger.info("[MQTT] %s" % str(mqttPayload))
            if isinstance(mqttPayload,dict):
                for key, value in mqttPayload.items():
                    if key in SUPPORTED_HEADERS:
                        logger.info(mqttPayload)
                        if value in SUPPORTED_DEVICES:
                            importDevice = __import__(value)
                            importDeviceClass = getattr(importDevice, value)
                            deviceClass = importDeviceClass()
                            loop = asyncio.get_event_loop()    
                            loop.create_task(deviceClass.deviceHandler(topic,payload))
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
        # yield from C.unsubscribe(['#'])
        # yield from C.disconnect()
    except ClientException as ce:
        logger.error("[MQTT ] Client exception: %s" % ce)
    except ConnectException as ce:
        logger.error("[MQTT] Connection exception: %s" % ce)    


@asyncio.coroutine
def publish(topic, value):
    print("------------Publishing-----------")
    try:
        yield from C.connect('mqtt://user:password@0.0.0.0:1883')
        yield from C.publish(topic, bytes(str(value),"UTF-8"), qos=0x01)
        logger.info("[MQTT] Message Published")
        yield from C.disconnect()
    except ConnectException as ce:
        logger.error("[MQTT] Connection exception: %s" % ce)       


        
    