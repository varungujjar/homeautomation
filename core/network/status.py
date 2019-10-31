import os, sys
sys.path.append('../')
import re
import subprocess
import json
import asyncio
import time
from helpers.logger import formatLogger
import datetime
from datetime import datetime, timedelta
from helpers.dt import *

TIMER = 15 #seconds

logger = formatLogger(__name__)

def pingGateway():
    response = os.popen("ping -q -w 1 -c 1 `ip r | grep default | cut -d ' ' -f 3` > /dev/null && echo 'connected' || echo 'disconnected'").read()
    return response.rstrip()


async def networkHandler():
    while True:
        getPing = pingGateway()
        if getPing == "disconnected":
            logger.error("Network Status => Disconnected)")
            await networkRestart()
        elif getPing == "connected":            
            logger.info("Network Status => Connected")
        await asyncio.sleep(TIMER)    
    

async def networkRestart():
    cmd = ["sudo","/etc/init.d/networking","restart"]
    logger.warning("Trying to Restart Network...")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    response = proc.stdout.read().decode('utf-8').rstrip()
    logger.info("Network Restarted!")
    return response



