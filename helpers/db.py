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


def dbInsertHistory(id,name,type,component,status,value):
	try:
		db = sqlite3.connect(db_path)
		cur = db.cursor()
		cur.execute("INSERT INTO notifications(id, name, type, component, status, value, read, created) VALUES(?,?,?,?,?,?,?,datetime(CURRENT_TIMESTAMP, 'localtime'))", (int(id), str(name),str(type),str(component),str(status),str(value),1))
		db.commit()
	except Exception as err:
		logger.eror('[DB] Notification Error: %s' % (str(err)))
	finally:
		db.close()
	sioConnect().emit('notification', str(name)+" "+str(status))		


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
	sioConnect().emit("device", thisDevice)
	return thisDevice


def dbGetDevice(component=None,address=None,id=None):
	db = sqlite3.connect(db_path)
	db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
	cur = db.cursor()
	if id is None:
		cur.execute('SELECT devices.*, rooms.id as room_id, rooms.name as room_name FROM devices LEFT JOIN rooms on room_id = rooms.id WHERE component=? AND address=?',(component,address))
		device = cur.fetchone()
	else:
		cur.execute('SELECT * FROM "devices" WHERE id=?',(id,))
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
			cur.execute("SELECT * FROM devices")
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


def dbGetDeviceRooms(id=None):
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		cur.execute("SELECT * FROM rooms")
		rooms = cur.fetchall()
		db.commit()
	except Exception as err:
		logger.eror('[DB] Get All Rooms Error: %s' % (str(err)))
	finally:
		db.close()
	if rooms is None:
		return {}	
	return rooms


def dbGetAutomationRules():
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		cur.execute('SELECT * FROM automation WHERE published = 1')
		automation = cur.fetchall()
		db.commit()
	except Exception as err:
		logger.eror('[DB] Get Rules Error: %s' % (str(err)))
	finally:
		db.close()
	if automation is None:
		return {}
	return automation


def setAutomationTriggerStatus(id,status):
	try:
		db = sqlite3.connect(db_path)
		cur = db.cursor()
		cur.execute("UPDATE automation SET trigger=?, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE id=?",(int(status), int(id)))
		db.commit()
	except Exception as err:
		logger.eror('[DB] Rule Set Active Error: %s' % (str(err)))
	finally:
		db.close()
	return True


def db_tb_automation_triggered(id):
	db = sqlite3.connect(db_path)
	cur = db.cursor()
	cur.execute('UPDATE automation SET last_triggered = CURRENT_TIMESTAMP WHERE id = ?',(id,))
	db.commit()
	return True	

