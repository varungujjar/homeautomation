import os
import json
from flask import Blueprint, request, Response
from flask import abort
from flask import current_app as app
from app.nlu.tasks import train_models
from app.commons.db import *

intents = Blueprint('intents_blueprint', __name__, url_prefix='/intents')


@intents.route('/', methods=['POST'])
def create_intent():
    content = request.get_json(silent=True)
    dbStore("intent", content)
    return Response(response=json.dumps({"result": True}), status=200, mimetype="application/json")


@intents.route('/')
def read_intents():
    all_intents = dbGetTable("intent")
    return Response(response=json.dumps(all_intents), status=200, mimetype="application/json")


@intents.route('/<id>')
def read_intent(id):
    get_intent = dbGetTable("intent",{"id":int(id)})
    return Response(response=json.dumps(get_intent), status=200, mimetype="application/json")


@intents.route('/<id>', methods=['PUT'])
def update_intent(id):
    json_data = json.loads(request.get_data())
    dbStore("intent", json_data)
    return 'success', 200


@intents.route('/<id>', methods=['DELETE'])
def delete_intent(id):
    # Intent.objects.get(id=ObjectId(id)).delete()
    # try:
    #     train_models()
    # except BaseException:
    #     pass
    # # remove NER model for the deleted story
    # try:
    #     os.remove("{}/{}.model".format(app.config["MODELS_DIR"], id))
    # except OSError:
    #     pass
    return Response(response=json.dumps({"result": True}), status=200, mimetype="application/json")


