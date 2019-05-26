import os, sys
sys.path.append('../')
import sqlite3
import json
import time, datetime
from helpers.logger import formatLogger
from system.status import deviceCheckIncoming
import socketio
logger = formatLogger(__name__)

global db_path
db_path = '/home/pi/db/db'


def sioConnect():
	sio = socketio.RedisManager('redis://', write_only=True)
	return sio


def formatDeviceEntries(device):
	jsonItem = {}
	for key, value in device.items():
		if key in ["properties","actions"]:
			jsonItem[key] = eval(value)
		else:	
			jsonItem[key] = value
	return jsonItem

def formatData(data):
	jsonItem = {}
	for key, value in data.items():
		if key in ["properties","actions","if","and","then"]:
			jsonItem[key] = eval(value)
		else:	
			jsonItem[key] = value
	return jsonItem


def dbGetConfig():
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		cur.execute("SELECT * FROM config")
		config = cur.fetchone()
		db.commit()
	except Exception as err:
		logger.eror('[DB] Config Error: %s' % (str(err)))
	finally:
		db.close()
	return config


def dbInsertHistory(type,identifier,params=None,title=None,message=None,store=None):
	if store == 1:
		try:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute("INSERT INTO notifications(type, identifier, params, title, message, read, created) VALUES(?,?,?,?,?,?,datetime(CURRENT_TIMESTAMP, 'localtime'))", (str(type), str(identifier),str(params),str(title),str(message),1))
			db.commit()
		except Exception as err:
			logger.eror('[DB] Notification Error: %s' % (str(err)))
		finally:
			db.close()
	data = {}
	data["type"] = type
	data["title"] = title
	data["message"] = message
	logger.info(str(data))
	sioConnect().emit('notification', data)		


def dbSetDeviceStatus(id,status):
	try:
		db = sqlite3.connect(db_path)
		cur = db.cursor()
		cur.execute("UPDATE devices SET online=?, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE id=?",(int(status),int(id)))
		db.commit()
	except Exception as err:
		logger.eror('[DB] Device Update Status Error: %s' % (str(err)))
	finally:
		db.close()


def dbSyncDevice(type,prop,actions,address,component):
	getDevice = dbGetDevice(component,address)
	if not getDevice:
		try:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute("INSERT INTO devices(address, type, component, properties, actions, online, modified, created) VALUES(?,?,?,?,?,datetime(CURRENT_TIMESTAMP, 'localtime'),datetime(CURRENT_TIMESTAMP, 'localtime'))", (str(address), str(type), str(component),str(prop), str(actions), 1))
			db.commit()
		except Exception as err:
			logger.eror('[DB] Device Insert Sync Error: %s' % (str(err)))
		finally:
			db.close()	
	else:
		deviceCheckIncoming(getDevice)
		try:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute("UPDATE devices SET type=?, properties=?, actions=?, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE address=? AND component=?",(str(type), str(prop), str(actions), str(address), str(component)))
			db.commit()
		except Exception as err:
			logger.eror('[DB] Device Update Sync Error: %s' % (str(err)))
		finally:
			db.close()
	thisDevice = dbGetDevice(component,address)
	sioConnect().emit(thisDevice["id"], thisDevice)
	return thisDevice

#needs to be combined with bottom dbgetall devices
def dbGetDevice(component=None,address=None,id=None):
	db = sqlite3.connect(db_path)
	db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
	cur = db.cursor()
	if id is None:
		cur.execute('SELECT devices.*, rooms.id as room_id, rooms.name as room_name FROM devices LEFT JOIN rooms on room_id = rooms.id WHERE component=? AND address=?',(component,address))
		device = cur.fetchone()
	else:
		cur.execute('SELECT devices.*, rooms.id as room_id, rooms.name as room_name FROM devices LEFT JOIN rooms on room_id = rooms.id WHERE devices.id=?',(id,))
		device = cur.fetchone()
	db.commit()
	if device is None:
		return {}
	else:
		device = formatDeviceEntries(device)			
	return device


def dbGetAllDevices(type=0):
	#type = 0 include system devices
	#type = 1 exclude system devices and featured devices
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		if(type==0):
			cur.execute("SELECT devices.*, rooms.id as room_id, rooms.name as room_name FROM devices LEFT JOIN rooms on room_id = rooms.id")
		else:
			cur.execute("SELECT devices.*, rooms.id as room_id, rooms.name as room_name FROM devices LEFT JOIN rooms on room_id = rooms.id WHERE type!=? AND featured=0",("system",))		
		devices = cur.fetchall()
		db.commit()
	except Exception as err:
		logger.eror('[DB] Get All Devices Error: %s' % (str(err)))
	finally:
		db.close()
	if devices is None:
		return {}	
	else:
		jsonDevices = []
		for device in devices:
			jsonDevices.append(formatDeviceEntries(device))
	return jsonDevices



def dbGetWeatherSensor():
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		cur.execute("SELECT * FROM devices WHERE type=? AND featured=? AND weather=?" , ("sensor", 1, 1))
		device = cur.fetchone()
		db.commit()
	except Exception as err:
		logger.eror('[DB] Weather Sensor Get Error: %s' % (str(err)))
	finally:
		db.close()
	if device is None:
		return {}
	else:
		device = formatDeviceEntries(device)			
	return device



def dbDeleteRecordsTable(tableName):
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		if tableName:
			cur.execute('DELETE FROM %s' % (tableName))		
			db.commit()
	except Exception as err:
		logger.eror('[DB] Delete Records Error: %s' % (str(err)))
	finally:
		db.close()





def dbGetTable(tableName,id=None,published=None,order=None):
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		if id:
			cur.execute('SELECT * FROM %s WHERE id=%s ' % (tableName,int(id)))		
			table = cur.fetchone()		
		elif published:
			cur.execute('SELECT * FROM %s WHERE published=%s' % (tableName,int(published)))
			table = cur.fetchall()
		else:
			if order:
				cur.execute('SELECT * FROM %s ORDER BY %s DESC' % (tableName, order))
			else:
				cur.execute('SELECT * FROM %s' % (tableName))
			table = cur.fetchall()
		db.commit()
	except Exception as err:
		logger.eror('[DB] Get Rules Error: %s' % (str(err)))
	finally:
		db.close()
	if id:	
		if table is None:
			return {}
		else:
			table = formatData(table)
			return table
	else:
		if table is None:
			return {}
		else:	
			tableFormat = []
			for tableItem in table:
				tableFormat.append(formatData(tableItem))
			return tableFormat


def dbPublished(tableName,id=None,published=None):
	try:
		db = sqlite3.connect(db_path)
		cur = db.cursor()
		cur.execute("UPDATE %s SET published=%s, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE id=%s" % (tableName,int(published),int(id)))
		db.commit()
	except Exception as err:
		logger.eror('[DB] Set Published Error: %s' % (str(err)))
	finally:
		db.close()
	return True




def setRuleTriggerStatus(id,status):
	try:
		db = sqlite3.connect(db_path)
		cur = db.cursor()
		cur.execute("UPDATE rules SET trigger=?, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE id=?",(int(status), int(id)))
		db.commit()
	except Exception as err:
		logger.eror('[DB] Rule Set Active Error: %s' % (str(err)))
	finally:
		db.close()
	return True


