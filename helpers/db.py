import sqlite3
import time, datetime
import json
global db_path
db_path = '/home/pi/db/db'


def dbGetConfig():
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		cur.execute("SELECT * FROM config")
		config = cur.fetchone()
		db.commit()
	except Exception as err:
		print('[DB] Config Error: %s' % (str(err)))
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
		print('[DB] Notification Error: %s' % (str(err)))
	finally:
		db.close()	


def dbSyncDevice(type,prop,actions,address,component):
	getDevice = dbGetDevice(component,address)
	if not getDevice:
		try:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute("INSERT INTO devices(address, type, component, properties, actions, modified, created) VALUES(?,?,?,?,?,datetime(CURRENT_TIMESTAMP, 'localtime'),datetime(CURRENT_TIMESTAMP, 'localtime'))", (str(address), str(type), str(component),str(prop), str(actions)))
			db.commit()
		except Exception as err:
			print('[DB] Device Insert Sync Error: %s' % (str(err)))
		finally:
			db.close()	
	else:
		try:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute("UPDATE devices SET type=?, properties=?, actions=?, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE address=? AND component=?",(str(type), str(prop), str(actions), str(address), str(component)))
			db.commit()
		except Exception as err:
			print('[DB] Device Update Sync Error: %s' % (str(err)))
		finally:
			db.close()
	thisDevice = dbGetDevice(component,address)
	return thisDevice


def dbGetDevice(component=None,address=None,id=None):
	db = sqlite3.connect(db_path)
	db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
	cur = db.cursor()
	if id is None:
		cur.execute('SELECT * FROM "devices" WHERE component=? AND address=?',(component,address))
		device = cur.fetchone()
	else:
		cur.execute('SELECT * FROM "devices" WHERE id=?',(id,))
		device = cur.fetchone()
	db.commit()
	if device is None:
		return {}			
	return device


def dbGetAllDevices():
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		cur.execute("SELECT * FROM devices")
		devices = cur.fetchall()
		db.commit()
	except Exception as err:
		print('[DB] Get All Devices Error: %s' % (str(err)))
	finally:
		db.close()
	if devices is None:
		return {}	
	return devices


def getAutomationRules():
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		cur.execute('SELECT * FROM automation WHERE active = 1')
		automation = cur.fetchall()
		db.commit()
	except Exception as err:
		print('[DB] Get Rules Error: %s' % (str(err)))
	finally:
		db.close()
	if automation is None:
		return {}
	return automation


def db_tb_automation_triggered(id):
	db = sqlite3.connect(db_path)
	cur = db.cursor()
	cur.execute('UPDATE automation SET last_triggered = CURRENT_TIMESTAMP WHERE id = ?',(id,))
	db.commit()
	return True	

