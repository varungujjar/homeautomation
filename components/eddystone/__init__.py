import os, sys
sys.path.append('../../')
import json
import asyncio
from helpers.logger import formatLogger
from beacontools import BeaconScanner, EddystoneTLMFrame, EddystoneFilter, parse_packet, EddystoneUIDFrame
from helpers.db import *

logger = formatLogger(__name__)
CHECK_EVERY = 1
CHECK_LAST_THRESHOLD = 60

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
	dbSyncDevice(data["address"],"eddystone","beacon",data,{},state=0)


async def eddystoneHandler():
	loop = asyncio.get_event_loop()
	loop.create_task(rangeCheckHandler())
	scanner = BeaconScanner(received,
		device_filter=EddystoneFilter(namespace="12345678901234678901"),
		packet_filter=EddystoneTLMFrame
	)
	scanner.start() # time.sleep(150) # scanner.stop()
	
	
async def rangeCheckHandler():
	await asyncio.sleep(CHECK_LAST_THRESHOLD)
	while True:
		beacons = dbGetTable("devices",{"type":"beacon","component":"eddystone"})
		dbCheckDeviceStatus(beacons,CHECK_LAST_THRESHOLD)
		await asyncio.sleep(CHECK_EVERY)

