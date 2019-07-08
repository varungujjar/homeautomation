import os, sys, json
import asyncio
import logging
import socketio
# from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.schedulers.blocking import BlockingScheduler
from events import *
sys.path.append('../')
logging.basicConfig(level=logging.INFO,format='%(asctime)s %(levelname)s %(message)s')


TIMER = 1

# external_sio = socketio.RedisManager('redis://', write_only=True)
logger = logging.getLogger(__name__)
UPDATE_EVERY = 1

if __name__ == '__main__':
    logger.info("[TIMER] Timer Running")
    sched = BlockingScheduler()
    sched.add_job(eventsHandler, "interval", seconds=UPDATE_EVERY)
    sched.start()