import os, sys
sys.path.insert(0, '../../')
#sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
from astral import *
import threading
from time import strftime, strptime
import pytz
from datetime import datetime, timedelta, tzinfo
from helpers.db import *
from helpers.dt import *


DATE_STR_FORMAT = "%Y-%m-%d"
UTC = DEFAULT_TIME_ZONE = pytz.utc  # type: dt.tzinfo

ZERO = timedelta(0)

COMPONENT = 'horizon'
UPDATE_EVERY = 5 #in seconds

def dispatch_data(type,prop,actions,address):
    db_sync_device(type,prop,actions,address,COMPONENT)


def sun_horizon(sunrise,sunset): #if 1 above horizon if 0 below horzion
	now_utc = datetime.now(UTC)
	horizon = False 
	if(now_utc > sunrise and now_utc < sunset):
		horizon = True	
	return horizon
			

def local_astral_event(config_data):
	a = Astral()
	latitude = float(config_data['latitude'])
	longitude = float(config_data['longitude'])
	location = Location(info = (config_data['city'], config_data['state'], latitude, longitude, config_data['timezone'], 100))
	a.solar_depression = 'civil'
	timezone = config_data['timezone']
	#location.timezone = config_data['timezone']
	sun = location.sun(date=datetime.today(), local=True)
	data = {}
	data['sunrise'] = sun['sunrise']
	data['sunset'] = sun['sunset']
	data['timezone'] = timezone
	return data


def horizon_handler():
	config_db = get_config()
	config_data = json.loads(config_db['config'])
	astral = local_astral_event(config_data)
	time_now = datetime.now(UTC)	
	sun_horizon_position = sun_horizon(astral['sunrise'], astral['sunset'])
	data = {}
	data['city'] = config_data['city']			
	data['state'] = config_data['state']			
	data['latitude'] = config_data['latitude']			
	data['longitude'] = config_data['longitude']			
	data['sunrise'] = str(astral['sunrise'])
	data['sunset'] = str(astral['sunset'])
	data['timezone'] = str(astral['timezone'])
	data['above_horizon'] = str(sun_horizon_position).lower()
	if(sun_horizon_position):
		data['next_astral'] = "sunset"
		data['next_astral_time'] = str(get_age(astral['sunset']))
	else:
		data['next_astral'] = "sunrise"	
		if(time_now > astral['sunset']):
			tommorrow = astral['sunrise'] + timedelta(days=1)
			data['next_astral_time'] =  str(get_age(tommorrow))
		else:
			data['next_astral_time'] =  str(get_age(astral['sunrise']))
	print data		
	#update_config(data,'sun')


def schedule(f_stop):
    horizon_handler()
    if not f_stop.is_set():
        threading.Timer(UPDATE_EVERY, schedule, [f_stop]).start()


f_stop = threading.Event()
schedule(f_stop)	

