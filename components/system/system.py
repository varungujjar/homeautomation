import os, sys
sys.path.insert(0, '../../')
import json,psutil
import asyncio
from helpers.logger import formatLogger

from xmlrpc.client import ServerProxy
server = ServerProxy('http://localhost:9001/RPC2')
logger = formatLogger(__name__)


def getCPUTemperature():
	temp = os.popen("vcgencmd measure_temp").readline()
	temp_format = temp.replace("temp=","")
	temperature = temp_format.replace("'C","")
	return temperature


def getMQTTStatus():
	mqttStatus = os.popen("systemctl is-active mosquitto.service").readline()
	return mqttStatus


def getRedisStatus():
	redisStatus = os.popen("systemctl is-active redis-server").readline()
	return redisStatus


def systemHandler():
	data ={}

	temperature = getCPUTemperature()
	data["cpu"] = {}
	data["cpu"]["percent"] =  str(psutil.cpu_percent(interval=None))
	data["cpu"]["temperature"]={}
	data["cpu"]["temperature"]["value"] = str(temperature)
	data["cpu"]["temperature"]["unit"] = "C"    
	
	data["memory"] = {}
	data["memory"]["total"] = str(psutil.virtual_memory().total)
	data["memory"]["available"] = str(psutil.virtual_memory().available)
	data["memory"]["used"] = str(psutil.virtual_memory().used)
	data["memory"]["free"] = str(psutil.virtual_memory().free)
	data["memory"]["percent"] = str(psutil.virtual_memory().percent)
	
	data["disk"] = {}
	data["disk"]["total"] = str(psutil.disk_usage("/").total)
	data["disk"]["used"] = str(psutil.disk_usage("/").used)
	data["disk"]["free"] = str(psutil.disk_usage("/").free)
	data["disk"]["percent"] = str(psutil.disk_usage("/").percent)

	data["process"] = {}
	data["process"] = server.supervisor.getProcessInfo('app')

	data["mqtt"] = {}
	data["mqtt"]["status"] = getMQTTStatus()

	data["redis"] = {}
	data["redis"]["status"] = getRedisStatus()

	deviceProperties = data
	logger.info("%s" % str(deviceProperties))
	return deviceProperties
		
		# await asyncio.sleep(UPDATE_EVERY)

