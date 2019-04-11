import os, sys
sys.path.insert(0, '../../')
import json,psutil
import logging
from apscheduler.schedulers.blocking import BlockingScheduler
from helpers.db import *
from helpers.dt import *

logger = logging.getLogger(__name__)
logger.propagate = True
logging.basicConfig(level=logging.WARNING,format='%(asctime)s %(levelname)s %(message)s')

COMPONENT = "system"
TYPE = "system"
UPDATE_EVERY = 5 #seconds

def deviceHandler():
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
	logger.info("[SYSTEM] %s" % str(deviceProperties))

sched = BlockingScheduler()
sched.add_job(deviceHandler, "interval", seconds=UPDATE_EVERY)
sched.start()
