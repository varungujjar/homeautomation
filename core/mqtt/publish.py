import os, sys
from helpers.logger import formatLogger
import asyncio

from hbmqtt.client import MQTTClient, ClientException, ConnectException
from hbmqtt.mqtt.constants import QOS_1
from core.mqtt.config import CONFIG

logger = formatLogger(__name__)


C = MQTTClient(config=CONFIG)

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


    