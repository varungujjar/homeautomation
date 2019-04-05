import os, sys, json, pytz
sys.path.insert(0, '../../')
#sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from astral import *
from apscheduler.schedulers.blocking import BlockingScheduler
from time import strftime, strptime
from datetime import datetime, timedelta, tzinfo
from helpers.db import *
from helpers.dt import *

DATE_STR_FORMAT = "%Y-%m-%d"
UTC = DEFAULT_TIME_ZONE = pytz.utc  # type: dt.tzinfo

ZERO = timedelta(0)

COMPONENT = "horizon"
TYPE = "system"
UPDATE_EVERY = 1


def sun_horizon(sunrise,sunset): #if 1 above horizon if 0 below horzion
	now_utc = datetime.now(UTC)
	horizon = False 
	if(now_utc > sunrise and now_utc < sunset):
		horizon = True	
	return horizon
			

def local_astral_event(config_data):
	a = Astral()
	latitude = float(config_data["latitude"])
	longitude = float(config_data["longitude"])
	location = Location(info = (config_data["city"], config_data["state"], latitude, longitude, config_data["timezone"], 100))
	a.solar_depression = "civil"
	timezone = config_data["timezone"]
	#location.timezone = config_data["timezone"]
	sun = location.sun(date=datetime.today(), local=True)
	data = {}
	data["sunrise"] = sun["sunrise"]
	data["sunset"] = sun["sunset"]
	data["timezone"] = timezone
	return data


def horizonHandler():
	config_db = dbGetConfig()
	config_data = json.loads(config_db["config"])
	astral = local_astral_event(config_data)
	time_now = datetime.now(UTC)	
	sun_horizon_position = sun_horizon(astral["sunrise"], astral["sunset"])
	data = {}
	data["location"] = {}
	data["astral"] = {}
	data["location"]["city"] = config_data["city"]			
	data["location"]["state"] = config_data["state"]			
	data["location"]["latitude"] = config_data["latitude"]			
	data["location"]["longitude"] = config_data["longitude"]	
	data["location"]["timezone"] = str(astral["timezone"])
	data["astral"]["sunrise"] = str(astral["sunrise"])
	data["astral"]["sunset"] = str(astral["sunset"])
	data["astral"]["above_horizon"] = str(sun_horizon_position).lower()
	if(sun_horizon_position):
		data["astral"]["next"] = "sunset"
		data["astral"]["next_time"] = str(get_age(astral["sunset"]))
	else:
		data["astral"]["next_astral"] = "sunrise"	
		if(time_now > astral["sunset"]):
			tommorrow = astral["sunrise"] + timedelta(days=1)
			data["astral"]["next_time"] =  str(get_age(tommorrow))
		else:
			data["astral"]["next_time"] =  str(get_age(astral["sunrise"]))
	deviceActions = {}
	deviceProperties = json.dumps(data)
	dbSyncDevice(TYPE,deviceProperties,deviceActions,"",COMPONENT)
	print(deviceProperties)


sched = BlockingScheduler()
sched.add_job(horizonHandler, "interval", minutes=UPDATE_EVERY)
sched.start()
