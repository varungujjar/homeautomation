import os, sys
sys.dont_write_bytecode = True
from publish import *
from switch import *

sys.path.insert(0, '../../')
from helpers.db import *

#mqtt_publish('livingroom/ambient/relay/0/set', 1)

_dome = switch()
k = _dome.stateToggleChange(9, 0)
v = _dome.stateToggleChange(8, 0)
 