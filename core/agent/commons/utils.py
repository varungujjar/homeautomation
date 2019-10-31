import json
import requests
from helpers.db import *
from helpers.logger import formatLogger

logger = formatLogger(__name__)


def split_sentence(sentence):
    return sentence.split("###")


def get_synonyms():
    #build synonyms from db dic
    synonyms = {}
    entities = dbGetTable("entity",None,"","agent")
    for entity in entities:
        for value in entity["entity_values"]:
            for synonym in value["synonyms"]:
                synonyms[synonym] = value["value"]
    logger.info("loaded synonyms %s", synonyms)
    return synonyms


def call_api(url, type, headers={}, parameters={}, is_json=False):
    #Call external API
    #param url:
    #param type:
    #param parameters:
    #param is_json:
    #return:
    logger.info("Initiating API Call with following info: url => {} payload => {}".format(url, parameters))
    if "GET" in type:
        response = requests.get(url, headers=headers, params=parameters, timeout=5)
    elif "POST" in type:
        if is_json:
            response = requests.post(url, headers=headers, json=parameters, timeout=5)
        else:
            response = requests.post(url, headers=headers, params=parameters, timeout=5)
    elif "PUT" in type:
        if is_json:
            response = requests.put(url, headers=headers, json=parameters, timeout=5)
        else:
            response = requests.put(url, headers=headers, params=parameters, timeout=5)
    elif "DELETE" in type:
        response = requests.delete(url, headers=headers, params=parameters, timeout=5)
    else:
        raise Exception("unsupported request method.")
    result = json.loads(response.text)
    logger.info("API response => %s", result)
    return result



