import sqlite3
global db_path
db_path = '/home/pi/bot/db/db'
typeIntCols = ["id"]



def formatData(data):
	jsonItem = {}
	for key, value in data.items():
		if key in ["training","parameters","entity_values"]:
			jsonItem[key] = eval(value)
		else:	
			jsonItem[key] = value
	return jsonItem



def dbGetTable(tableName,colQuery=None, orderQuery=""):
	response = False
	compileCols = []
	if colQuery is not None:
		for col in colQuery:
			if col in typeIntCols:
				colData = colQuery[col]	
			else:
				colData = str('"%s"' % colQuery[col])
			compileCols.append("%s=%s" % (col, colData))
		joinQuery = " AND ".join(compileCols)
		try:
			db = sqlite3.connect(db_path)
			db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
			cur = db.cursor()
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
			print("Table %s Error: %s" % (tableName, str(err)))
		finally:
			db.close()
	else:
		try:
			db = sqlite3.connect(db_path)
			db.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
			cur = db.cursor()
			cur.execute("SELECT * FROM %s %s" % (tableName,orderQuery))		
			table = cur.fetchall()
			db.commit()
		except Exception as err:
			print("Table %s Error: %s" % (tableName, str(err)))
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



def dbStore(tableName, formData):
	response = False
	if "id" in formData:
		if formData["id"] == 0 or formData["id"] == "":
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
				print('%s Inserted Successfully %s' % (tableName, lastrowid))
			except Exception as err:
				response = False
				print('%s Insert Error: %s' % (tableName,str(err)))
			finally:
				db.close()
		else:
			createUpdate = []
			for col in formData:
				if col != "id":
					if col in typeIntCols:
						colData = formData[col]	
					else:
						temp_data = str(formData[col])
						colData = str('"%s"' % temp_data)
						
					createUpdate.append('%s=%s' % (col, colData))
			joinUpdate = ",".join(createUpdate)
			try:
				print(joinUpdate)
				db = sqlite3.connect(db_path)
				cur = db.cursor()
				cur.execute("UPDATE %s SET %s, modified=datetime(CURRENT_TIMESTAMP, 'localtime') WHERE id=?" % (tableName,joinUpdate), (formData["id"], ))
				db.commit()
				response = True
				print('%s Store Successfully' % (tableName))
			except Exception as err:
				response = False
				print('%s Store Error: %s' % (tableName,str(err)))
			finally:
				db.close()
			
	return response
