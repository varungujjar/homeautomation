import os, sys, json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from apscheduler.schedulers.blocking import BlockingScheduler
from events import *

UPDATE_EVERY = 1

sched = BlockingScheduler()
sched.add_job(eventsHandler, "interval", seconds=UPDATE_EVERY)
sched.start()