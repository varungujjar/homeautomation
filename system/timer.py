import os, sys, json
import asyncio
import logging
import socketio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from events import *
sys.path.append('../')

TIMER = 1

external_sio = socketio.RedisManager('redis://', write_only=True)
logger = logging.getLogger(__name__)

UPDATE_EVERY = 1

if __name__ == '__main__':
    sched = AsyncIOScheduler()
    sched.add_job(eventsHandler, "interval", seconds=TIMER)
    sched.start()
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        pass