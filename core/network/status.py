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
    response_ip = subprocess.Popen("ping -q -w 1 -c 1 `ip r | grep default | cut -d ' ' -f 3` > /dev/null && echo 'connected' || echo 'disconnected'", stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True).stdout.read().decode('utf-8').rstrip()
    return response_ip


async def networkHandler():
    while True:
        getPing = pingGateway()
        if getPing == "connected":            
            logger.info("Network Status => Connected")
        else:
            logger.warning("Network Status => Disconnected")
            await networkRestart()
        await asyncio.sleep(TIMER)    
    

async def networkRestart():
    logger.warning("Trying to Reconnect...")

    cmd_down = ["sudo","ifconfig","wlan0", "down"]
    subprocess.Popen(cmd_down, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout.read()
    cmd_up = ["sudo","ifconfig","wlan0", "up"]
    proc_up = subprocess.Popen(cmd_up, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    response = proc_up.stdout.read().decode('utf-8').rstrip()
    return response



