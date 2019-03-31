import os, sys
sys.path.insert(0, '../../')
#sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json,pytz,psutil
from apscheduler.schedulers.blocking import BlockingScheduler
from time import strftime, strptime
from datetime import datetime, timedelta, tzinfo
from helpers.db import *
from helpers.dt import *

DATE_STR_FORMAT = "%Y-%m-%d"
UTC = DEFAULT_TIME_ZONE = pytz.utc  # type: dt.tzinfo

ZERO = timedelta(0)

COMPONENT = 'system'
UPDATE_EVERY = 5 #seconds

def dispatch_data(type,prop,actions,address):
    db_sync_device(type,prop,actions,address,COMPONENT)

def horizon_handler():
	data ={}
	data['cpu'] = {}
	data['cpu']['value'] =  str(psutil.cpu_percent(interval=None))    
	data['cpu']['unit'] =  '%'    
	data['memory'] = {}
	data['memory']['value'] = str(psutil.virtual_memory().percent)
	data['memory']['unit'] =  '%'
	data['disk'] = {}
	data['disk']['value'] = str(psutil.disk_usage('/').percent)
	data['disk']['unit'] = '%'
	actions = {}
	dataJson = json.dumps(data)
	dispatch_data('system',dataJson,actions,'')	

sched = BlockingScheduler()
sched.add_job(horizon_handler, 'interval', seconds=UPDATE_EVERY)
sched.start()
