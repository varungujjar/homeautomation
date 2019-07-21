import os, sys, json
from helpers.logger import formatLogger
import asyncio

SUPPORTED_HEADERS = {"class"}
SUPPORTED_DEVICES = {"switch","light"}

from hbmqtt.client import MQTTClient, ClientException, ConnectException
from hbmqtt.mqtt.constants import QOS_1

logger = formatLogger(__name__)

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
def mqttHandler():
    yield from C.connect('mqtt://user:password@0.0.0.0:1883')
    yield from C.subscribe([('#', QOS_1)])
    logger.info("Subscribed to #")
    try:
        while True:
            message = yield from C.deliver_message()
            packet = message.publish_packet
            topic = packet.variable_header.topic_name
            payload = str(packet.payload.data.decode())
            mqttPayload = json.loads(payload)
            # logger.info("%s" % str(mqttPayload))
            if isinstance(mqttPayload,dict):
                for key, value in mqttPayload.items():
                    if key in SUPPORTED_HEADERS:
                        logger.info(mqttPayload)
                        if value in SUPPORTED_DEVICES:
                            importDevice = __import__("components.mqtt."+value, fromlist=value)
                            importDeviceClass = getattr(importDevice, value)
                            deviceClass = importDeviceClass()
                            loop = asyncio.get_event_loop()    
                            loop.create_task(deviceClass.deviceHandler(topic,payload))
                            try:
                                pass
                            except ImportError as error:
                                logger.error("%s" % str(error))
                            except Exception as exception:
                                logger.error(" %s" % str(exception))
                        else:
                            logger.warning("Device Not Supported")       
                    else:
                        pass
        # yield from C.unsubscribe(['#'])
        # yield from C.disconnect()
    except ClientException as ce:
        logger.error("Client exception: %s" % ce)
    except ConnectException as ce:
        logger.error("Connection exception: %s" % ce)    


    