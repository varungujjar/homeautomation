from flask import Blueprint, request, Response
import json
from app.commons.db import *

bots = Blueprint('bots_blueprint', __name__, url_prefix='/agents/<bot_name>')


@bots.route('/config', methods=['PUT'])
def set_config(bot_name):
    content = request.get_json(silent=True)
    dbStore("bot", content)
    return Response(response=json.dumps({"result": True}), status=200, mimetype="application/json")


@bots.route('/config', methods=['GET'])
def get_config(bot_name):
    bot = dbGetTable("bot",{"name":bot_name})
    return Response(response=json.dumps(bot[0]), status=200, mimetype="application/json")
