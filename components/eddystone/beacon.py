from . import *


class  beacon(object):
	def __init__(self):
		pass
        
	def validateProperties(self,getDevice,conditionProperties,conditionType):
		validStatus = False
		getDeviceProperties = getDevice["properties"]
		getDevicePropertiesKeys = []
		for key, value in getDeviceProperties.items():
			getDevicePropertiesKeys.append(key)    
		for key, value in conditionProperties.items():
			if key == "online":
				if value == getDevice["online"]:
					validStatus = True
			else:        
				if key in getDevicePropertiesKeys:
					getDeviceProperty = getDeviceProperties[key]
					getIfProperty = conditionProperties[key]
						
					if conditionType == "=":
						if getDeviceProperty == getIfProperty:
							validStatus = True

					elif conditionType == ">":
						if getDeviceProperty > getIfProperty:
							validStatus = True

					elif conditionType == "<":
						if getDeviceProperty < getIfProperty:
							validStatus = True
		return validStatus
