from nltk import word_tokenize
from nltk.tag.perceptron import PerceptronTagger
from core.agent.nlu.classifiers.starspace_intent_classifier import EmbeddingIntentClassifier
from core.agent.nlu.entity_extractor import EntityExtractor
from helpers.db import *
from helpers.logger import formatLogger
logger = formatLogger(__name__)



def train_models():
    response = False
    # generate intent classifier training data
    intents = dbGetTable("intent",None,"","agent")
    if not intents:
        raise Exception("NO_DATA")

    # train intent classifier on all intents
    train_intent_classifier(intents)

    # train ner model for each Stories
    for intent in intents:
        train_all_ner(str(intent["intentId"]), intent["training"])
    response = True
    logger.info("Training Completed") 
    return response    
    # model_updated_signal.send(app, message="Training Completed.")


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


def train_all_ner(intentId, training_data):
    entityExtraction = EntityExtractor()
    entityExtraction.train(training_data, intentId)


# Load and initialize Perceptron tagger
tagger = PerceptronTagger()


def pos_tagger(sentence):
    """
    perform POS tagging on a given sentence
    :param sentence:
    :return:
    """
    tokenized_sentence = word_tokenize(sentence)
    pos_tagged_sentence = tagger.tag(tokenized_sentence)
    return pos_tagged_sentence


def pos_tag_and_label(sentence):
    """
    Perform POS tagging and BIO labeling on given sentence
    :param sentence:
    :return:
    """
    tagged_sentence = pos_tagger(sentence)
    tagged_sentence_json = []
    for token, postag in tagged_sentence:
        tagged_sentence_json.append([token, postag, "O"])
    return tagged_sentence_json


def sentence_tokenize(sentences):
    """
    Sentence tokenizer
    :param sentences:
    :return:
    """
    tokenized_sentences = word_tokenize(sentences)
    return " ".join(tokenized_sentences)
