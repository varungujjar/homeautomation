import os, sys, json
sys.path.insert(0, '../')
from helpers.db import *


def triggerEvent():
    pass
    #rulesEngine()


def rulesEngine():
    getRules = getAutomationRules()
    print(getRules)
    value = "switch"
    importDevice = __import__(value)
    importDeviceClass = getattr(importDevice, value)
    deviceClass = importDeviceClass()    
    deviceClass.stateToggleChange(9, 0, 1)
