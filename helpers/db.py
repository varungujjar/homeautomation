import sqlite3
import time, datetime
import json
global db_path
db_path = '/home/pi/db/db'


def get_config():
	db = sqlite3.connect(db_path)
	db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
	cur = db.cursor()
	cur.execute('SELECT * FROM config')
	config = cur.fetchone()
	db.commit()
	return config


def db_sync_device(type,prop,actions,address,component):
	device = db_get_device(component,address)
	if not device:
		db = sqlite3.connect(db_path)
		cur = db.cursor()
		cur.execute("INSERT INTO devices(address, type, component, properties, actions, modified, created) VALUES(?,?,?,?,?,datetime(CURRENT_TIMESTAMP, 'localtime'),datetime(CURRENT_TIMESTAMP, 'localtime'))", (str(address), str(type), str(component),str(prop), str(actions)))
		db.commit()
	else:
		db = sqlite3.connect(db_path)
		cur = db.cursor()
		cur.execute("UPDATE devices SET address=?, type=?, component=?, properties=?, actions=?, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE id = ?",(str(address), str(type), str(component),str(prop), str(actions), device['id']))
		db.commit()
	print db_get_device(component,address)


def db_get_device(component=None,address=None,id=None):
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




def update_config(data,type):
	db = sqlite3.connect(db_path)
	if(type=='sun'):
		cur = db.cursor()
		cur.execute('UPDATE config SET sun = ?, last_modified=CURRENT_TIMESTAMP',(str(json.dumps(data)),))
	if(type=='forecast'):
		format_data = str(data)		
		cur = db.cursor()
		cur.execute('UPDATE config SET forecast = ?, last_modified=CURRENT_TIMESTAMP',(format_data,))	
	db.commit()	


def que_notification(component,type,message):
	db = sqlite3.connect(db_path)
	cur = db.cursor()
	cur.execute('INSERT INTO notifications(component, type, message, unread, last_modified) VALUES(?,?,?,?,CURRENT_TIMESTAMP)', (str(component), str(type), str(message),1))
	db.commit()
	

def db_tb_automation():
	db = sqlite3.connect(db_path)
	db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
	cur = db.cursor()
	cur.execute('SELECT * FROM automation WHERE active = 1')
	automation = cur.fetchall()
	db.commit()
	if automation is None:
		return {}
	return automation

def db_tb_automation_triggered(id):
	db = sqlite3.connect(db_path)
	cur = db.cursor()
	cur.execute('UPDATE automation SET last_triggered = CURRENT_TIMESTAMP WHERE id = ?',(id,))
	db.commit()
	return True	


def db_get_all_devices():
	db = sqlite3.connect(db_path)
	db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
	cur = db.cursor()
	cur.execute('SELECT * FROM devices')
	devices = cur.fetchall()
	db.commit()
	if devices is None:
		return {}
	return devices
	


def db_get_devices(component):
	db = sqlite3.connect(db_path)
	cur = db.cursor()
	cur.execute('SELECT * FROM devices WHERE device_component=?', (component,))
	devices = cur.fetchall()
	db.commit()
	return devices





def db_update_device(component,data):	
	if(data['id']):
		device = db_get_device(data['id'])
		if len(device) > 0:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute('UPDATE devices SET data=?, hardware_id=?, state=?, device_type=?, access=?, last_modified = CURRENT_TIMESTAMP WHERE id = ? AND device_component=?',(str(json.dumps(data['data'])), data['hardware_id'], data['state'], data['device_type'], 1, data['id'], component))
		else:
			#add to new device 	
			pass	
	db.commit()


def db_unchecked_devices():
	db = sqlite3.connect(db_path)
	db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
	cur = db.cursor()
	cur.execute('SELECT * FROM devices WHERE access=1')
	db.commit()
	return cur.fetchall()


def db_check_device(id):
	db = sqlite3.connect(db_path)

	cur = db.cursor()
	cur.execute('UPDATE devices SET access=0 WHERE id=? ',(id,))
	db.commit()

