import os, sys
sys.path.append('../../')
import json
import asyncio
from helpers.logger import formatLogger
import time
from datetime import datetime as dt
from beacontools import BeaconScanner, EddystoneTLMFrame, EddystoneFilter, parse_packet, EddystoneUIDFrame
from helpers.db import *
from helpers.dt import *
from core.notifications import *

logger = formatLogger(__name__)

TIMER = 10 #seconds
CHECK_THRESHOLD = 10 #seconds if device did not respond it will be considered as offline

def received(bt_addr, rssi, packet, additional_info):
	data = {}
	data["address"] = bt_addr
	data["rssi"] = rssi
	if packet:
		data["battery"] = packet.voltage
		data["temperature"] = packet.temperature
		data["adv_count"] = packet.advertising_count
		data["seconds_boot"] = packet.seconds_since_boot
	if additional_info:	
		data["namespace"] = additional_info["namespace"]
		data["instance"] = additional_info["instance"]
	logger.info("%s" % str(data))
	getBeacons = dbGetTable("devices",{"type":"eddystone","component":"beacon"})
	for beacon in getBeacons:
		if beacon["parameters"]["instance"]==data["instance"] and beacon["address"]==str(bt_addr):
			if beacon["online"]==0:
				storeNotification("success","device",beacon["component"],"Beacon "+beacon["name"]+" is now in range",True)
				logger.info("Beacon(%d) %s is in range" % (beacon["id"],beacon["name"]))
			dbStore("devices", {"id":int(beacon["id"]),"properties":str(data),"online":1})
		else:
			pass #do something for the new device discovered
	

async def ibeaconHandler():
	loop = asyncio.get_event_loop()
	loop.create_task(rangeCheckHandler())
	scanner = BeaconScanner(received,
		device_filter=EddystoneFilter(namespace="12345678901234678901"),
		packet_filter=EddystoneTLMFrame
	)
	scanner.start()
	# time.sleep(150)
	# scanner.stop()


async def rangeCheckHandler():
	while True:
		getBeacons = dbGetTable("devices",{"type":"eddystone","component":"beacon"})
		for beacon in getBeacons:
			now = dt.now()
			modified = dt.strptime(str(beacon["modified"]), '%Y-%m-%d %H:%M:%S')
			delta = now-modified
			seconds = delta.seconds
			if seconds > CHECK_THRESHOLD:
				logger.warning("Beacon(%d) %s is out of range" % (beacon["id"],beacon["name"]))
				pushNotification("error","device",beacon["component"],"Beacon "+beacon["name"]+" out of range")
				dbStore("devices",{"id":int(beacon["id"]),"online":0})
		await asyncio.sleep(TIMER)


class  ibeacon(object):
	def __init__(self):
		pass
        
	def validateProperties(self,getDevice,conditionProperties,conditionType):
		validStatus = False
		getDeviceProperties = getDevice["properties"]
		getDevicePropertiesKeys = []
		for key, value in getDeviceProperties.items():
			getDevicePropertiesKeys.append(key)    
		for key, value in conditionProperties.items():
			if key in getDevicePropertiesKeys:
				if isinstance(value,dict):
					for k, v in value.items():
						getDeviceProperty= getDeviceProperties[key][k]
						getIfProperty = conditionProperties[key][k]
				else:
					getDeviceProperty = getDeviceProperties[key]
					getIfProperty = conditionProperties[key]
					
				if conditionType == "=":
					if getDeviceProperty == getIfProperty:
						validStatus = True
		return validStatus
