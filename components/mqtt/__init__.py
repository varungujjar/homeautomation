import os, sys, json
from helpers.logger import formatLogger
from helpers.db import *
import asyncio
from helpers.db import *
from hbmqtt.client import MQTTClient, ClientException, ConnectException
from hbmqtt.mqtt.constants import QOS_1

SUPPORTED_HEADERS = {"class"}
SUPPORTED_DEVICES = {"switch","light"}

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

logger = formatLogger(__name__)


@asyncio.coroutine
def mqttHandler():
    yield from C.connect('mqtt://'+getParmeters("mqtt","username")+':'+getParmeters("mqtt","password")+'@'+getParmeters("mqtt","host")+':'+str(getParmeters("mqtt","port")))
    yield from C.subscribe([("homie", QOS_1)])
    logger.info("Subscribed to Topic 'homie'")
    
    try:
        while True:
            message = yield from C.deliver_message()
            packet = message.publish_packet
            topic = packet.variable_header.topic_name
            payload = str(packet.payload.data.decode())
            mqttPayload = json.loads(payload)
            logger.info(topic+' => '+str(mqttPayload))
            # logger.info("%s" % str(mqttPayload))
            if isinstance(mqttPayload,dict):
                for key, value in mqttPayload.items():
                    if key in SUPPORTED_HEADERS:
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


    