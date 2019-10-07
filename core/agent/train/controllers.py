from flask import Blueprint, request, Response
import json
from app.commons.db import *


train = Blueprint('train_blueprint', __name__, url_prefix='/train')


@train.route('/<story_id>/data', methods=['POST'])
def save_training_data(story_id):
    content = request.get_json(silent=True)
    content_compile = {"id":int(story_id),"training":content}
    dbStore("intent", content_compile)
    return Response(response=json.dumps({"result": True}), status=200, mimetype="application/json")


@train.route('/<story_id>/data', methods=['GET'])
def get_training_data(story_id):
    get_intent = dbGetTable("intent",{"id":int(story_id)})
    return Response(response=json.dumps(get_intent["training"]), status=200, mimetype="application/json")
