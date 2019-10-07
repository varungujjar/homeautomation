from flask import Blueprint, request, Response
import json
from app.commons.db import *

entities_blueprint = Blueprint('entities_blueprint', __name__, url_prefix='/entities')

@entities_blueprint.route('/', methods=['POST'])
def create_entity():
    content = request.get_json(silent=True)
    dbStore("entity", content)
    return Response(response=json.dumps({"result": True}), status=200, mimetype="application/json")


@entities_blueprint.route('/')
def read_entities():
    entities = dbGetTable("entity")
    return Response(response=json.dumps(entities), status=200, mimetype="application/json")


@entities_blueprint.route('/<id>')
def read_entity(id):
    entity = dbGetTable("entity",{"id":int(id)})
    return Response(response=json.dumps(entity), status=200, mimetype="application/json")


@entities_blueprint.route('/<id>', methods=['PUT'])
def update_entity(id):
    json_data = json.loads(request.get_data())
    dbStore("entity", json_data)
    return 'success', 200


@entities_blueprint.route('/<id>', methods=['DELETE'])
def delete_entity(id):
    # Entity.objects.get(id=ObjectId(id)).delete()
    return Response(response=json.dumps({"result": True}), status=200, mimetype="application/json")
