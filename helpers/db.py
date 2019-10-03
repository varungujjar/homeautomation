import os, sys
sys.path.append('../')
import sqlite3
import json
from helpers.logger import formatLogger
from helpers.dt import *
import socketio
import time
from datetime import datetime as dt

logger = formatLogger(__name__)

global db_path
db_path = '/home/pi/db/db_home'
# db_path = '/Volumes/Work/homeautomation/db/db'
typeIntCols = ["published","trigger","system","enable","service","online","weather","order","room_id"]

def sioConnect():
	sio = socketio.RedisManager('redis://', write_only=True)
	return sio


def getParmeters(component,param):
	component = dbGetTable("components",{"id":component})
	if component["parameters"]:
		for parameter in component["parameters"]:
			if param == parameter["key"]:
				return parameter["value"]
	else:
		logger.error("Component Parameters Not Found.")	



def formatData(data):
	jsonItem = {}
	for key, value in data.items():
		if key in ["properties","actions","rule_if","rule_and","rule_then","parameters"]:
			jsonItem[key] = eval(value)
		else:	
			jsonItem[key] = value
	return jsonItem


def Merge(oldProps, newProps): 
    result = {**oldProps, **newProps} 
    return result 



def dbStoreNotification(notificationClass,type,title,message):
	dbStore("notifications",{"id":0,"class":str(notificationClass),"type":str(type),"title":str(title),"message":str(message)})



def dbPushNotification(notificationClass,type,title,message):
	data = {}
	data["type"] = notificationClass
	data["title"] = title
	data["message"] = message
	sioConnect().emit("notification", data)



def dbCheckDeviceStatus(devices,threshold):
	for getDevice in devices:
		deviceId = getDevice["id"]
		deviceName = getDevice["name"]
		deviceRoomName = getDevice["room_name"]
		deviceComponent = getDevice["component"]
		now = dt.now()
		modified = dt.strptime(str(device["modified"]), '%Y-%m-%d %H:%M:%S')
		delta = now-modified
		seconds = delta.seconds
		if seconds > threshold:
			if device["online"] == 1:
				dbStore("devices",{"id":int(deviceId),"online":0})
				thisDevice = dbGetTable("devices",{"id":int(deviceId)})
				sendDeviceSocketData(int(deviceId),thisDevice)
				dbStoreNotification("error","device",deviceRoomName or deviceComponent,deviceName+" is offline")
				dbPushNotification("error","device",deviceRoomName or deviceComponent,deviceName+" is offline")
				logger.warning("Device(%d) %s is offline" % (deviceId,deviceName or deviceComponent))
				


def sendDeviceSocketData(deviceId, deviceData):
	sioConnect().emit(int(deviceId), deviceData)



def dbSyncDevice(address,component,type,properties,actions,state=0):
	getDevice = dbGetTable("devices",{"address":address,"component":component,"type":type})[0]
	deviceId = getDevice["id"]
	deviceOnline = getDevice["online"]
	deviceName = getDevice["name"]
	deviceRoomName = getDevice["room_name"]
	deviceComponent = getDevice["component"]
	if getDevice:
		if deviceOnline == 0:
			dbStoreNotification("success","device",deviceRoomName or deviceComponent,"Device "+deviceName+" is now Online")
			dbPushNotification("success","device",deviceRoomName or deviceComponent,"Device "+deviceName+" is now Online")
			logger.info("Device(%d) %s is online" % (deviceId,deviceName))
		combinedProperties = Merge(getDevice["properties"],properties)
		dbStore("devices",{"id":int(deviceId),"properties":combinedProperties,"actions":actions,"state":int(state),"online":1})
	else:
		pass
		# dbStore("devices",{"properties":combinedProperties,"actions":actions,"state":int(state),"online":1})
	thisDevice = dbGetTable("devices",{"id":int(deviceId)})
	sendDeviceSocketData(deviceId,thisDevice)
	return thisDevice



def dbGetTable(tableName,colQuery=None, orderQuery=""):
	response = False
	compileCols = []
	if colQuery is not None:
		for col in colQuery:
			if col in typeIntCols:
				colData = colQuery[col]	
			else:
				colData = str('"%s"' % colQuery[col])
			if(tableName=="devices"):
				compileCols.append("devices.%s=%s" % (col, colData))
			else:
				compileCols.append("%s=%s" % (col, colData))
		joinQuery = " AND ".join(compileCols)
		try:
			db = sqlite3.connect(db_path)
			db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
			cur = db.cursor()
			if(tableName=="devices"):
				cur.execute("SELECT devices.*, rooms.id as room_id, rooms.name as room_name FROM devices LEFT JOIN rooms on room_id = rooms.id WHERE %s %s" % (joinQuery,orderQuery))
			else:	
				cur.execute("SELECT * FROM %s WHERE %s %s" % (tableName,joinQuery,orderQuery))
			if len(colQuery) > 1:
				table = cur.fetchall()
			else:
				if "id" in colQuery:		
					table = cur.fetchone()
				else:
					table = cur.fetchall()
			db.commit()
		except Exception as err:
			logger.error("Table %s Error: %s" % (tableName, str(err)))
		finally:
			db.close()
		
	else:
		try:
			db = sqlite3.connect(db_path)
			db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
			cur = db.cursor()
			if(tableName=="devices"):
				cur.execute("SELECT devices.*, rooms.id as room_id, rooms.name as room_name FROM devices LEFT JOIN rooms on room_id = rooms.id %s" % (orderQuery))
			else:
				cur.execute("SELECT * FROM %s %s" % (tableName,orderQuery))		
			table = cur.fetchall()
			db.commit()
		except Exception as err:
			logger.error("Table %s Error: %s" % (tableName, str(err)))
		finally:
			db.close()
	if isinstance(table,dict):
		response = formatData(table)
	elif isinstance(table,list):
		tableFormat = []
		for tableItem in table:
			tableFormat.append(formatData(tableItem))
		response = tableFormat	
	return response	




def dbDelete(tableName,id=None):
	response = False
	if id:
		try:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute("DELETE FROM %s WHERE id=%s" % (tableName, int(id)))
			db.commit()
			response = True
		except Exception as err:
			response = False
			logger.error('Record Delete Error: %s' % (str(err)))
		finally:
			db.close()
	else:
		try:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute("DELETE FROM %s" % (tableName))
			db.commit()
			response = True
		except Exception as err:
			response = False
			logger.error('Record Delete Error: %s' % (str(err)))
		finally:
			db.close()
	return response



def dbStore(tableName, formData):
	response = False
	if "id" in formData:
		if formData["id"] != 0:
			createUpdate = []
			for col in formData:
				if col != "id":
					if col in typeIntCols:
						colData = formData[col]	
					else:
						colData = str('"%s"' % formData[col])
					createUpdate.append("%s=%s" % (col, colData))
			joinUpdate = ",".join(createUpdate)
			try:
				db = sqlite3.connect(db_path)
				cur = db.cursor()
				cur.execute("UPDATE %s SET %s, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE id=?" % (tableName,joinUpdate), (formData["id"], ))
				db.commit()
				response = True
				logger.info('"%s" Store Successfully' % (tableName))
			except Exception as err:
				response = False
				logger.error('"%s" Store Error: %s' % (tableName,str(err)))
			finally:
				db.close()
		else:
			createInsertCols = []
			createInsertValuesMark = []
			createInsertValues = []
			for col in formData:
				if col != "id":
					if col in typeIntCols:
						colValue = str(formData[col])	
					else:
						colValue = str('"%s"' % formData[col])
					createInsertCols.append("%s" % (col))
					createInsertValuesMark.append("?")
					createInsertValues.append(colValue)
			joinInsertCols = ",".join(createInsertCols)
			joinInsertMarks = ",".join(createInsertValuesMark)
			joinInsertValues = ",".join(createInsertValues)
			try:
				db = sqlite3.connect(db_path)
				cur = db.cursor()
				cur.execute("INSERT INTO %s(%s, created) VALUES(%s,datetime(CURRENT_TIMESTAMP, 'localtime'))" % (tableName,joinInsertCols,joinInsertValues))
				db.commit()
				lastrowid = cur.lastrowid
				response = lastrowid
				logger.info('"%s" Inserted Successfully %s' % (tableName, lastrowid))
			except Exception as err:
				response = False
				logger.error('"%s" Insert Error: %s' % (tableName,str(err)))
			finally:
				db.close()
	return response


