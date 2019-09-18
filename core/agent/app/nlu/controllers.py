from flask import Blueprint, Response
from app.nlu.tasks import train_models
import json

nlu = Blueprint('nlu_blueprint', __name__, url_prefix='/nlu')

@nlu.route('/build_models', methods=['POST'])
def build_models():
    train_models()
    return Response(response=json.dumps({"result": True}), status=200, mimetype="application/json")
