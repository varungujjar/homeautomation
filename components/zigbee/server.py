import serial, os, sys, json
from xbee import XBee
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.dont_write_bytecode = True

SERIALPORT = "/dev/ttyUSB0" 
BAUDRATE = 9600

ser = serial.Serial(SERIALPORT, BAUDRATE)
xbee = XBee(ser)

COMPONENT = "xbee"
SUPPORTED_HEADERS = {"pr"}
SUPPORTED_DEVICES = {"sensor","door","plant"}


def getJsonFormatted(payload):
    payload = str(payload.decode())
    list_decode = payload.split(",")
    list_enum = []
    for eachItem in list_decode:
        list_enum.append(eachItem.split(":"))
    list_enum_dict = {k[0]:k[1] for k in list_enum}
    return list_enum_dict


def getJsonData(payload):
    jsonItem = {}
    for key, value in payload.items():
        if key != "rf_data":
            jsonItem[key] = value
    jsonItem["payload"] = {}
    jsonItem["payload"] = getJsonFormatted(payload["rf_data"])
    return jsonItem


def xbeeHandler(payload):
    xbeeData = getJsonData(payload)
    xbeePayload = xbeeData["payload"]
    
    for key, value in xbeePayload.items():
        if key in SUPPORTED_HEADERS:
            if value in SUPPORTED_DEVICES:
                try:
                    importDevice = __import__(value)
                    importDeviceClass = getattr(importDevice, value)
                    deviceClass = importDeviceClass()    
                    k = deviceClass.deviceHandler(xbeeData)
                except ImportError:
                    print("[XBEE] Error Importing Device")
                    pass
            else:
                print("[XBEE] Server Device Not Supported")      
        else:
            pass    


while True:
    try:
        response = xbee.wait_read_frame()
        xbeeHandler(response)
    except KeyboardInterrupt:
        break

ser.close()