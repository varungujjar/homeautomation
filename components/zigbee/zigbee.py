import serial, time, datetime, sys
import json
import binascii
from xbee import XBee
sys.path.insert(0, '../../')
from helpers.db import *

SERIALPORT = "/dev/ttyUSB0" 
BAUDRATE = 9600

ser = serial.Serial(SERIALPORT, BAUDRATE)
xbee = XBee(ser)

COMPONENT = 'xbee'

ENUM_TYPE = {
    'pr':['profile'],
    't':['temperature','C'],
    'h':['humidity','%'],
    'p':['pressure','hPa'],
    'o':['gas','ppm'],
    'a':['altitude','m'],
    'l':['light','lux'],
    'v':['voltage','mAh']
    }


def dispatch_data(type,prop,actions,address):
    db_sync_device(type,prop,actions,address,COMPONENT)



def xbee_device_handler(data):
    payload = data['payload']
    if 'pr' in payload:#pr is the header of my devices
        prop = {}
        type = payload['pr']
        for key, value in payload.iteritems():
            if key in ENUM_TYPE:
                prop[ENUM_TYPE[key][0]] = {}
                prop[ENUM_TYPE[key][0]]['value'] = value
                try:
                    if ENUM_TYPE[key][1]:
                        prop[ENUM_TYPE[key][0]]['unit'] = ENUM_TYPE[key][1]
                except IndexError:
                        pass
            else:
                prop["unknown"]=value
            actions = {}   
        dispatch_data(type,prop,actions,data['address'])    
    
    

def xbee_enumerate(response):
    json_data = response
    data = {}
    #print b(json_data['source_addr_long']).hex() For Python 3.4 above
    data['address'] = binascii.hexlify(json_data['source_addr_long'])
    data['source_address'] = binascii.hexlify(json_data['source_addr'])
    #split rfdata and recompile as json data
    payload = json_data['rf_data']
    list_decode = payload.split(",")
    list_enum = []
    for eachItem in list_decode:
        list_enum.append(eachItem.split(":"))
    list_enum_dict = {k[0]:k[1] for k in list_enum}
    data['payload'] = list_enum_dict
    xbee_device_handler(data)



while True:
    try:
        response = xbee.wait_read_frame()
        xbee_enumerate(response)
    except KeyboardInterrupt:
        break

ser.close()