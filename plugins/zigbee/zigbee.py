import serial, time, datetime, sys
import json
from xbee import XBee

SERIALPORT = "/dev/ttyUSB0" 
BAUDRATE = 9600

ser = serial.Serial(SERIALPORT, BAUDRATE)
xbee = XBee(ser)

_PROTOCOL = 'xbee'


def xbee_dispatch_data:
    break

def xbee_enumerate(response):
    json_data = json.loads(response)
    print json_data

while True:
    try:
        response = xbee.wait_read_frame()
        xbee_enumerate(response)
        #do_component(_PROTOCOL,response)
        #print response
    except KeyboardInterrupt:
        break

ser.close()