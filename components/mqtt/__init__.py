import os, sys, json
from helpers.logger import formatLogger
from helpers.db import *
import asyncio
from hbmqtt.client import MQTTClient, ClientException, ConnectException
from hbmqtt.mqtt.constants import QOS_1


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
    yield from C.subscribe([("#", QOS_1)])
    logger.info("Subscribed to Topic '#'")
    
    try:
        while True:
            message = yield from C.deliver_message()
            packet = message.publish_packet
            topic = packet.variable_header.topic_name
            payload = str(packet.payload.data.decode())
            logger.debug(topic+' => '+str(payload))
            try:
                mqttPayload = json.loads(payload)
            except:
                mqttPayload = str(payload)
            getMqttDevices = dbGetTable("devices",{"component":"mqtt"})
            for mqttDevice in getMqttDevices:
                mqttType = mqttDevice["type"]
                importDevice = __import__("components.mqtt."+mqttType, fromlist=mqttType)
                importDeviceClass = getattr(importDevice, mqttType)
                deviceClass = importDeviceClass()
                loop = asyncio.get_event_loop()    
                loop.create_task(deviceClass.deviceHandler(topic,mqttPayload,mqttDevice))
                try:
                    pass
                except ImportError as error:
                    logger.error("%s" % str(error))
                except Exception as exception:
                    logger.error(" %s" % str(exception))



        # yield from C.unsubscribe(['#'])
        # yield from C.disconnect()
    except ClientException as ce:
        logger.error("Client exception: %s" % ce)
    except ConnectException as ce:
        logger.error("Connection exception: %s" % ce)    


    