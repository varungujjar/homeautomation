import logging
import asyncio

from hbmqtt.client import MQTTClient, ClientException, ConnectException
from hbmqtt.mqtt.constants import QOS_1


#
# This sample shows how to subscbribe a topic and receive data from incoming messages
# It subscribes to '$SYS/broker/uptime' topic and displays the first ten values returned
# by the broker.
#

logger = logging.getLogger(__name__)



def dosomething():
    asyncio.ensure_future(publish())

@asyncio.coroutine
def uptime_coro():
    C = MQTTClient()
    yield from C.connect('mqtt://0.0.0.0:1883')
    # yield from C.connect('mqtt://0.0.0.0:1883')
    yield from C.subscribe([('#', QOS_1)])
    logger.info("Subscribed")
    dosomething()
    
    try:
        while True:
            message = yield from C.deliver_message()
            packet = message.publish_packet
            topic = packet.variable_header.topic_name
            print(str(packet.payload.data))
            
        # yield from C.unsubscribe(['#'])
        # logger.info("UnSubscribed")
        # yield from C.disconnect()
    except ClientException as ce:
        logger.error("Client exception: %s" % ce)


@asyncio.coroutine
def publish():
    print("started ")
    C = MQTTClient()
    yield from C.connect('mqtt://0.0.0.0:1883')
    tasks = [
        asyncio.ensure_future(C.publish('bedroom/lamp/relay/0/set', b'0', qos=QOS_1))
    ]
    yield from asyncio.wait(tasks)
    logger.info("messages published")
    yield from C.disconnect()


if __name__ == '__main__':
    
    try:
        asyncio.get_event_loop().run_until_complete(uptime_coro())
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        print("Closing Loop")
        loop.close()
    