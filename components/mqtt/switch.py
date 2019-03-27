import os, sys
import json
#sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

COMPONENT = 'mqtt'
CLASS = 'switch'

ENUM_PROPERTIES = {'ip','mac','host','ssid','rssi','uptime','vcc','version','voltage','current','apparent','factor','energy','relay/0','relay/1'}
ACTIONS = {'publish','subscribe','relay'}


class mqttSwitch(object):
    def __init__(self, data=None, topic=None):
        self.data = data
        self.topic = topic
        #print(data)

    def deviceHandler(self,data,topic):
        deviceData = json.loads(data)
        deviceProperties = {}
        deviceActions = {}
        deviceAddress = ''
        if CLASS in deviceData['class']:
            for key, value in deviceData.iteritems():
                if key in ENUM_PROPERTIES:
                    deviceProperties[key] = value
                else:
                    pass
        else:
            pass
        print(deviceProperties)
