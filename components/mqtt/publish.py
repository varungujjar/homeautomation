import os, sys
import asyncio
from hbmqtt.client import MQTTClient, ClientException, ConnectException
from hbmqtt.mqtt.constants import QOS_1
from helpers.db import *

logger = formatLogger(__name__)

config = {
        'keep_alive': int(getParmeters("mqtt","keepalive")),
        'ping_delay': 2,
        'default_qos': int(getParmeters("mqtt","qos")),
        'default_retain': False,
        'auto_reconnect': getParmeters("mqtt","autoreconnect"),
        'reconnect_max_interval':int(getParmeters("mqtt","reconnectinterval")),
        'reconnect_retries': int(getParmeters("mqtt","reconnectretries"))
}

C = MQTTClient(config=config)

@asyncio.coroutine
def publish(topic, value):
    try:
        yield from C.connect('mqtt://user:password@0.0.0.0:1883')
        yield from C.publish(topic, bytes(str(value),"UTF-8"), qos=QOS_1)
        logger.info(topic+" => "+str(value))
        yield from C.disconnect()
    except ConnectException as ce:
        logger.error("Connection exception: %s" % ce)       


    