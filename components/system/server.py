import os, sys
sys.path.insert(0, '../../')
import json,psutil
import asyncio
from helpers.logger import formatLogger
from helpers.db import *
from helpers.dt import *

logger = formatLogger(__name__)

COMPONENT = "system"
TYPE = "system"
UPDATE_EVERY = 30 #seconds

async def systemHandler():
	while True:
		data ={}
		data["cpu"] = {}
		data["cpu"]["value"] =  str(psutil.cpu_percent(interval=None))    
		data["cpu"]["unit"] =  "%"    
		data["memory"] = {}
		data["memory"]["value"] = str(psutil.virtual_memory().percent)
		data["memory"]["unit"] =  "%"
		data["disk"] = {}
		data["disk"]["value"] = str(psutil.disk_usage("/").percent)
		data["disk"]["unit"] = "%"
		deviceActions = {}
		deviceProperties = json.dumps(data)
		dbSyncDevice(TYPE,deviceProperties,deviceActions,"",COMPONENT)
		logger.info("%s" % str(deviceProperties))
		await asyncio.sleep(UPDATE_EVERY)

