import os, sys
from helpers.logger import formatLogger
import asyncio

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
def publish(topic, value):
    logger.info("Publishing Message")
    try:
        yield from C.connect('mqtt://user:password@0.0.0.0:1883')
        yield from C.publish(topic, bytes(str(value),"UTF-8"), qos=0x01)
        logger.info("Message Published")
        yield from C.disconnect()
    except ConnectException as ce:
        logger.error("Connection exception: %s" % ce)       


    