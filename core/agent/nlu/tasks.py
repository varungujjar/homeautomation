from core.agent.nlu.classifiers.starspace_intent_classifier import EmbeddingIntentClassifier
from core.agent.nlu.extractors.sklearn_entity_extractor import EntityExtractor
from helpers.db import *
from helpers.logger import formatLogger
import json

logger = formatLogger(__name__)



def train_models():
    response = False
    # generate intent classifier training data
    intents = dbGetTable("intent",None,"","agent")
    if not intents:
        raise Exception("NO_DATA")
    train_intent_classifier(intents)
    for intent in intents:
        train_all_ner(str(intent["intentId"]), intent["training"])
    response = True
    logger.info("Training Completed") 
    return response    


def train_intent_classifier(intents):
    X = []
    y = []
    for intent in intents:
        training_data = intent["training"]
        for example in training_data:
            if example.get("text").strip() == "":
                continue
            X.append(example.get("text"))
            y.append(str(intent["intentId"]))
    intent_classifier = EmbeddingIntentClassifier(use_word_vectors=True)
    intent_classifier.train(X, y)
    intent_classifier.persist(model_dir="core/agent/model_files/")


# def train_intent_classifier(intents): #assembling data for new Rasa code
#     common_examples = []
#     for intent in intents:
#         training_data = intent["training"]
#         for example in training_data:
#             example_item = {
#                 "text": example["text"].strip(),
#                 "intent": intent["intentId"],
#                 "entities": example["entities"]
#             }
#             common_examples.append(example_item)
#     intent_classifier = EmbeddingIntentClassifier()
#     intent_classifier.train(common_examples)
#     intent_classifier.persist(model_dir="core/agent/model_files/")


def train_all_ner(intentId, training_data):
    entityExtraction = EntityExtractor()
    entityExtraction.train(training_data, intentId)

