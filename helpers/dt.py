import datetime
import time
from datetime import datetime, timedelta
import pytz

UTC = DEFAULT_TIME_ZONE = pytz.utc  # type: dt.tzinfo

def time_now():
    return datetime.now()

def local_time():
    now = datetime_from_utc_to_local(datetime.now(UTC))
    return now

def datetime_from_utc_to_local(utc_datetime):
    now_timestamp = time.time()
    offset = datetime.fromtimestamp(now_timestamp) - datetime.utcfromtimestamp(now_timestamp)
    return utc_datetime + offset    

def get_age(date):
    def formatn(number, unit):
        """Add "unit" if it's plural."""
        if number == 1:
            return "1 %s" % unit
        elif number > 1:
            return "%d %ss" % (number, unit)
    def q_n_r(first, second):
        return first // second, first % second
    now = datetime.now(UTC)
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