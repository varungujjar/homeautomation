import datetime
import time
from datetime import datetime, timedelta
import pytz
from dateutil.parser import parse

UTC = DEFAULT_TIME_ZONE = pytz.utc  # type: dt.tzinfo
local_tz = pytz.timezone('Asia/Kolkata')

def time_now():
    return datetime.now()

def local_time():
    now = datetime_from_utc_to_local(datetime.now(UTC))
    return now

def datetime_from_utc_to_local(utc_datetime):
    now_timestamp = time.time()
    offset = datetime.fromtimestamp(now_timestamp) - datetime.utcfromtimestamp(now_timestamp)
    return utc_datetime + offset    

def datetime_from_local_to_utc(datetime):
    return UTC.localize(datetime)  

def utc_aware_to_datetime(datetime):
    dt = parse(str(datetime))
    datetime_obj = dt.strftime("%Y-%m-%d %H:%M:%S")
    datetime_obj_result = datetime.strptime(str(datetime_obj), '%Y-%m-%d %H:%M:%S')
    return datetime_obj_result



def get_age(date):

    def formatn(number, unit):
        data = {}
        """Add "unit" if it's plural."""
        if number == 1:
            data["number"] = 1
            data["unit"] = unit
            return data
        elif number > 1:
            data["number"] = number
            data["unit"] = unit+str("s")
            return data

    def q_n_r(first, second):
        return first // second, first % second

    now = datetime.now()
    if(now > date):    
    	delta = now - date
    else:
    	delta = date - now
    day = delta.days
    second = delta.seconds
    year, day = q_n_r(day, 365)
    if year > 0:
        return formatn(year, 'year')
    month, day = q_n_r(day, 30)
    if month > 0:
        return formatn(month, 'month')
    if day > 0:
        return formatn(day, 'day')
    hour, second = q_n_r(second, 3600)
    if hour > 0:
        return formatn(hour, 'hour')
    minute, second = q_n_r(second, 60)
    if minute > 0:
        return formatn(minute, 'minute')
    return formatn(second, 'second') if second > 0 else "0 seconds"