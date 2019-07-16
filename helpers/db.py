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
# db_path = '/home/pi/db/db'
db_path = '/Volumes/Work/homeautomation/db/db'


def sioConnect():
	sio = socketio.RedisManager('redis://', write_only=True)
	return sio


def Merge(oldProps, newProps): 
    result = {**oldProps, **newProps} 
    return result 


def formatData(data):
	jsonItem = {}
	for key, value in data.items():
		if key in ["properties","actions","rule_if","rule_and","rule_then"]:
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
		logger.error('[DB] Config Error: %s' % (str(err)))
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
			logger.error('[DB] Notification Error: %s' % (str(err)))
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
		logger.error('[DB] Device Update Status Error: %s' % (str(err)))
	finally:
		db.close()


def dbSyncDevice(type,prop,actions,address,component):
	getDevice = dbGetDevice(component,type,address)
	if not getDevice:
		try:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute("INSERT INTO devices(address, type, component, properties, actions, online, modified, created) VALUES(?,?,?,?,?,datetime(CURRENT_TIMESTAMP, 'localtime'),datetime(CURRENT_TIMESTAMP, 'localtime'))", (str(address), str(type), str(component),str(prop), str(actions), 1))
			db.commit()
		except Exception as err:
			logger.error('[DB] Device Insert Sync Error: %s' % (str(err)))
		finally:
			db.close()	
	else:
		deviceCheckIncoming(getDevice)
		combinedProperties = Merge(getDevice["properties"],prop)
		try:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute("UPDATE devices SET properties=?, actions=?, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE component=? AND type=? AND address=?",(str(combinedProperties), str(actions), str(component), str(type), str(address)))
			db.commit()
		except Exception as err:
			logger.error('[DB] Device Update Sync Error: %s' % (str(err)))
		finally:
			db.close()
	thisDevice = dbGetDevice(component,type,address)
	sioConnect().emit(thisDevice["id"], thisDevice)
	return thisDevice


def dbGetComponent(id=None):
	if id:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		cur.execute('SELECT * FROM components WHERE identifier=?', (str(id),))
		component = cur.fetchone()
		db.commit()
	if component is None:
		return {}
	else:
		component = formatData(component)
	return component



#needs to be combined with bottom dbgetall devices
def dbGetDevice(component=None,type=None,address=None,id=None):
	db = sqlite3.connect(db_path)
	db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
	cur = db.cursor()
	if id is None:
		cur.execute('SELECT devices.*, rooms.id as room_id, rooms.name as room_name FROM devices LEFT JOIN rooms on room_id = rooms.id WHERE component=? AND type=? AND address=?',(component,type,address))
		device = cur.fetchone()
	else:
		cur.execute('SELECT devices.*, rooms.id as room_id, rooms.name as room_name FROM devices LEFT JOIN rooms on room_id = rooms.id WHERE devices.id=?',(id,))
		device = cur.fetchone()
	db.commit()
	if device is None:
		return {}
	else:
		device = formatData(device)			
	return device



def dbGetDevices():
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		cur.execute("SELECT devices.*, rooms.id as room_id, rooms.name as room_name FROM devices LEFT JOIN rooms on room_id = rooms.id ORDER BY 'order' ASC")
		devices = cur.fetchall()
		db.commit()
	except Exception as err:
		logger.error('[DB] Get All Devices Error: %s' % (str(err)))
	finally:
		db.close()
	if devices is None:
		return {}	
	else:
		jsonDevices = []
		for device in devices:
			jsonDevices.append(formatData(device))
	return jsonDevices




def dbGetTable(tableName,id=None,published=None,order=None,system=None):
	try:
		db = sqlite3.connect(db_path)
		db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
		cur = db.cursor()
		if id:
			cur.execute("SELECT * FROM %s WHERE id=%s" % (tableName,int(id)))		
			table = cur.fetchone()		
		elif published:
			cur.execute("SELECT * FROM %s WHERE published=%s" % (tableName,int(published)))
			table = cur.fetchall()
		elif system == 0 or system:
			cur.execute("SELECT * FROM %s WHERE system=%s" % (tableName,int(system)))
			table = cur.fetchall()	
		else:
			if order:
				cur.execute("SELECT * FROM %s ORDER BY %s DESC" % (tableName, order))
			else:
				cur.execute("SELECT * FROM %s" % (tableName))
			table = cur.fetchall()
		db.commit()
	except Exception as err:
		logger.error("[DB] Get Rules Error: %s" % (str(err)))
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
		response = True
	except Exception as err:
		response = False
		logger.error('Set Published Error: %s' % (str(err)))
	finally:
		db.close()
	return response


def dbDelete(tableName,id=None):
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


def dbStoreRule(formData):
	if "id" in formData:
		if formData["id"] != 0:
			try:
				db = sqlite3.connect(db_path)
				cur = db.cursor()
				cur.execute("UPDATE rules SET rule_if=?, rule_and=?,  rule_then=?, published=?, trigger=1, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE id=?", (str(formData["rule_if"]), str(formData["rule_and"]), str(formData["rule_then"]), int(formData["published"]), int(formData["id"]) ))
				db.commit()
				logger.info('Rule Saved Successfully')
				showNotification("success","Success","Your data was saved successfully")	
			except Exception as err:
				logger.error('[DB] Save Rule Error: %s' % (str(err)))
				showNotification("error","DB Store Error","There was an error saving your data")
			finally:
				db.close()
		else:
			try:
				db = sqlite3.connect(db_path)
				cur = db.cursor()
				cur.execute("INSERT INTO rules(rule_if, rule_and, rule_then, published, modified, created) VALUES(?,?,?,?,datetime(CURRENT_TIMESTAMP, 'localtime'),datetime(CURRENT_TIMESTAMP, 'localtime'))", (str(formData["rule_if"]), str(formData["rule_and"]), str(formData["rule_then"]), int(formData["published"])))
				db.commit()
				showNotification("success","Success","Your data was saved successfully")	
			except Exception as err:
				logger.error('[DB] Device Insert Sync Error: %s' % (str(err)))
				showNotification("error","DB Store Error","There was an error saving your data")
			finally:
				db.close()
	return True


def showNotification(type,title,message):
	data = {}
	data["type"] = type
	data["title"] = title
	data["message"] = message
	# if(type=="success"):
	# 	logger.success(str(data))
	# elif(type=="error"):
	# 	logger.error(str(data))
	# elif(type=="warning"):
	# 	logger.warning(str(data))			
	sioConnect().emit('notification', data)		



def setRuleTriggerStatus(id,status):
	try:
		db = sqlite3.connect(db_path)
		cur = db.cursor()
		cur.execute("UPDATE rules SET trigger=?, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE id=?",(int(status), int(id)))
		db.commit()
	except Exception as err:
		logger.error('[DB] Rule Set Active Error: %s' % (str(err)))
	finally:
		db.close()
	return True


