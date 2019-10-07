
import json
# from core.agent.endpoint.utils import call_api
from core.agent.endpoint.utils import get_synonyms
from core.agent.endpoint.utils import split_sentence
from core.agent.nlu.classifiers.starspace_intent_classifier import EmbeddingIntentClassifier
from core.agent.nlu.entity_extractor import EntityExtractor
from core.agent.nlu.tasks import model_updated_signal
from helpers.db import *

from helpers.logger import formatLogger
logger = formatLogger(__name__)



sentence_classifier = None
synonyms = None
entity_extraction = None


# Request Handler
def getConversation(request_json):

    


    """
    Endpoint to converse with chatbot.
    Chat context is maintained by exchanging the payload between client and bot.

    sample input/output payload =>

    {
      "currentNode": "",
      "complete": false,
      "parameters": [],
      "extractedParameters": {},
      "missingParameters": [],
      "intent": {
      },
      "context": {},
      "input": "hello",
      "speechResponse": [
      ]
    }

    """
    result_json = request_json

    if request_json:

        context = {"context": request_json["context"]}

        if "init_conversation" in request_json["input"]:
            intent = dbGetTable("intent",{"intentId":"init_conversation"},"","agent")[0]
            result_json["complete"] = True
            result_json["intent"]["object_id"] = str(intent["id"])
            result_json["intent"]["id"] = str(intent["intentId"])
            result_json["input"] = request_json["input"]
            result_json["speechResponse"] = split_sentence(intent["speechResponse"])

            logger.info(result_json)

            return Response(response=json.dumps(result_json), status=200, mimetype="application/json")

        intent_id, confidence, suggestions = predict(request_json["input"])
        logger.info("intent_id => %s" % intent_id)

        intent = dbGetTable("intent",{"intentId":intent_id},"","agent")[0]
        if intent["parameters"]:
            parameters = intent["parameters"]
        else:
            parameters = []


           

        if ((request_json["complete"] is None) or (
                request_json["complete"] is True)):
            result_json["intent"] = {
                "object_id": str(intent["id"]),
                "confidence": confidence,
                "id": str(intent["intentId"])
            }

            if parameters:
                # Extract NER entities
                extracted_parameters = entity_extraction.predict(intent_id, request_json["input"])

                missing_parameters = []
                result_json["missingParameters"] = []
                result_json["extractedParameters"] = {}
                result_json["parameters"] = []
                for parameter in parameters:
                  

                    result_json["parameters"].append({
                        "name": parameter["name"],
                        "type": parameter["type"],
                        "required": parameter["required"]
                    })

                    if parameter["required"]:
                        if parameter["name"] not in extracted_parameters.keys():
                            result_json["missingParameters"].append(
                                parameter["name"])
                            missing_parameters.append(parameter)

                result_json["extractedParameters"] = extracted_parameters

                if missing_parameters:
                    result_json["complete"] = False
                    current_node = missing_parameters[0]
                    result_json["currentNode"] = current_node["name"]
                    result_json["speechResponse"] = split_sentence(current_node["prompt"])
                else:
                    result_json["complete"] = True
                    context["parameters"] = extracted_parameters
            else:
                result_json["complete"] = True

        elif request_json["complete"] is False:
            if "cancel" not in intent["name"]:
                intent_id = request_json["intent"]["id"]
                intent = dbGetTable("intent",{"intentId":intent_id},"","agent")[0]

                extracted_parameter = entity_extraction.replace_synonyms({
                    request_json["currentNode"]: request_json["input"]
                })

                # replace synonyms for entity values
                result_json["extractedParameters"].update(extracted_parameter)

                result_json["missingParameters"].remove(request_json["currentNode"])

                if len(result_json["missingParameters"]) == 0:
                    result_json["complete"] = True
                    context = {"parameters": result_json["extractedParameters"],
                               "context": request_json["context"]}
                else:
                    missing_parameter = result_json["missingParameters"][0]
                    result_json["complete"] = False
                    current_node = [node for node in intent["parameters"] if missing_parameter in node["name"]][0]
                    result_json["currentNode"] = current_node["name"]
                    result_json["speechResponse"] = split_sentence(current_node["prompt"])
            else:
                result_json["currentNode"] = None
                result_json["missingParameters"] = []
                result_json["parameters"] = {}
                result_json["intent"] = {}
                result_json["complete"] = True

        if result_json["complete"]:
            if intent["apiTrigger"]:
                # isJson = False
                # parameters = result_json["extractedParameters"]
                # headers = intent.apiDetails.get_headers()
                # app.logger.info("headers %s" % headers)
                # url_template = Template(
                #     intent.apiDetails.url, undefined=SilentUndefined)
                # rendered_url = url_template.render(**context)
                # if intent.apiDetails.isJson:
                #     isJson = True
                #     request_template = Template(
                #         intent.apiDetails.jsonData, undefined=SilentUndefined)
                #     parameters = json.loads(request_template.render(**context))

                # try:
                #     result = call_api(rendered_url,
                #                       intent.apiDetails.requestType, headers,
                #                       parameters, isJson)
                # except Exception as e:
                #     app.logger.warn("API call failed", e)
                #     result_json["speechResponse"] = ["Service is not available. Please try again later."]
                # else:
                #     context["result"] = result
                #     template = Template(intent["speechResponse"], undefined=SilentUndefined)
                #     result_json["speechResponse"] = split_sentence(template.render(**context))
                context["result"] = {}
                result_json["speechResponse"] = split_sentence(intent["speechResponse"])
            else:
                context["result"] = {}
                result_json["speechResponse"] = split_sentence(intent["speechResponse"])
        logger.info(request_json["input"])
        return json.dumps(result_json)
    else:
        return abort(400)


def update_model(message, **extra):
    """
    Signal hook to be called after training is completed.
    Reloads ml models and synonyms.
    :param app:
    :param message:
    :param extra:
    :return:
    """
    global sentence_classifier

    sentence_classifier = EmbeddingIntentClassifier.load("core/agent/model_files/", True)
    synonyms = get_synonyms()

    global entity_extraction

    entity_extraction = EntityExtractor(synonyms)

    logger.info("Intent Model updated")



# model_updated_signal.connect(update_model, app)


def predict(sentence):
    """
    Predict Intent using Intent classifier
    :param sentence:
    :return:
    """
    bot = dbGetTable("bot",{"name":"default"},"","agent")[0]
    predicted, intents = sentence_classifier.process(sentence)
    logger.info("predicted intent %s", predicted)
    if predicted["confidence"] < bot["confidence_threshold"]:
        intents = dbGetTable("intent",{"intentId":"fallback"},"","agent")
        intents = intents[0]["intentId"]
        return intents, 1.0, []
    else:
       
        return predicted["intent"], predicted["confidence"], intents[1:]
