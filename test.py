import os, sys
sys.path.append('../')
import json
import asyncio
import time
import logging
from datetime import datetime, timedelta, tzinfo


path = './components'
# if len(sys.argv) == 2:
#     path = sys.argv[1]
 

def listdirs2(folder):
    return [
        d for d in (os.path.join(folder, d1) for d1 in os.listdir(folder))
        if os.path.isdir(d)
    ]


def getList(path):
    folderList = [d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]
    dirList = []
    ignorelist = {"__pycache__"}
    for folderItem in folderList:
        if folderItem not in ignorelist:
            dirList.append(folderItem)
    return dirList

def runTaskList(path):
    componentsList = getList(path)
    for component in componentsList:
        fileList = os.listdir(path+"/"+component)
        if "server.py" in fileList:
            print(component)

print(runTaskList(path))



# files = os.listdir(path)
# for name in files:
#     print(name)