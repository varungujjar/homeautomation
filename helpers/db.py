import sqlite3
import json
global db_path
db_path = '/home/pi/database/smarthome'


def get_config():
	db = sqlite3.connect(db_path)
	db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
	cur = db.cursor()
	cur.execute('SELECT * FROM config')
	config = cur.fetchone()
	db.commit()
	return config

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


def que_notification(platform,type,message):
	db = sqlite3.connect(db_path)
	cur = db.cursor()
	cur.execute('INSERT INTO notifications(platform, type, message, unread, last_modified) VALUES(?,?,?,?,CURRENT_TIMESTAMP)', (str(platform), str(type), str(message),1))
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
	


def db_get_devices(platform):
	db = sqlite3.connect(db_path)
	cur = db.cursor()
	cur.execute('SELECT * FROM devices WHERE device_platform=?', (platform,))
	devices = cur.fetchall()
	db.commit()
	return devices


def db_get_device(id):
	db = sqlite3.connect(db_path)
	db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
	cur = db.cursor()
	cur.execute('SELECT * FROM devices WHERE id=?',(id,))
	device = cur.fetchone()
	db.commit()
	if device is None:
		return {}
	return device


def db_update_device(platform,data):	
	if(data['id']):
		device = db_get_device(data['id'])
		if len(device) > 0:
			db = sqlite3.connect(db_path)
			cur = db.cursor()
			cur.execute('UPDATE devices SET data=?, hardware_id=?, state=?, device_type=?, access=?, last_modified = CURRENT_TIMESTAMP WHERE id = ? AND device_platform=?',(str(json.dumps(data['data'])), data['hardware_id'], data['state'], data['device_type'], 1, data['id'], platform))
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

