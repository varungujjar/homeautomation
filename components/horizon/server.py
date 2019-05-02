import os, sys
sys.path.append('../../')
import json
import asyncio
import pytz
from helpers.logger import formatLogger
from astral import *
from time import strftime, strptime
from datetime import datetime, timedelta, tzinfo
from helpers.db import *
from helpers.dt import *

logger = formatLogger(__name__)

DATE_STR_FORMAT = "%Y-%m-%d"
UTC = DEFAULT_TIME_ZONE = pytz.utc

ZERO = timedelta(0)

COMPONENT = "horizon"
TYPE = "system"
UPDATE_EVERY = 1

def sun_horizon(sunrise,sunset): #if 1 above horizon if 0 below horzion
	now_utc = datetime.now()
	print(sunrise)
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


async def horizonHandler():
	while True:
		config_db = dbGetConfig()
		config_data = json.loads(config_db["config"])
		astral = local_astral_event(config_data)
		time_now = datetime.now()
		sun_horizon_position = sun_horizon(utc_aware_to_datetime(astral["sunrise"]), utc_aware_to_datetime(astral["sunset"]))
		data = {}
		data["location"] = {}
		data["astral"] = {}
		data["astral"]["next_time"] = {}
		data["location"]["city"] = config_data["city"]			
		data["location"]["state"] = config_data["state"]			
		data["location"]["latitude"] = config_data["latitude"]			
		data["location"]["longitude"] = config_data["longitude"]	
		data["location"]["timezone"] = str(astral["timezone"])
		data["astral"]["sunrise"] = str(utc_aware_to_datetime(astral["sunrise"]))
		data["astral"]["sunset"] = str(utc_aware_to_datetime(astral["sunset"]))
		data["astral"]["above_horizon"] = str(sun_horizon_position).lower()
		if(sun_horizon_position):
			data["astral"]["next_astral"] = "sunset"
			data["astral"]["next_time"] = get_age(utc_aware_to_datetime(astral["sunset"]))
		else:
			data["astral"]["next_astral"] = "sunrise"	
			if(time_now > utc_aware_to_datetime(astral["sunset"])):
				tommorrow = utc_aware_to_datetime(astral["sunrise"]) + timedelta(days=1)
				data["astral"]["next_time"] =  get_age(tommorrow)
			else:
				data["astral"]["next_time"] =  get_age(utc_aware_to_datetime(astral["sunrise"]))
		deviceActions = {}
		deviceProperties = json.dumps(data)
		thisHorizon = dbSyncDevice(TYPE,deviceProperties,deviceActions,"",COMPONENT)
		logger.info("%s" % str(deviceProperties))
		sioConnect().emit('horizon',thisHorizon)
		await asyncio.sleep(60)


