import os, sys
sys.path.insert(0, '../../')
import json,psutil
from apscheduler.schedulers.blocking import BlockingScheduler
from helpers.db import *
from helpers.dt import *

DATE_STR_FORMAT = "%Y-%m-%d"
UTC = DEFAULT_TIME_ZONE = pytz.utc  # type: dt.tzinfo

ZERO = timedelta(0)

TYPE = "system"
COMPONENT = "system"
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
	print(deviceProperties)

sched = BlockingScheduler()
sched.add_job(deviceHandler, "interval", seconds=UPDATE_EVERY)
sched.start()
