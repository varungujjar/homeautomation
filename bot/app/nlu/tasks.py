from app import app
from app import my_signals
from nltk import word_tokenize
from nltk.tag.perceptron import PerceptronTagger
from app.nlu.classifiers.starspace_intent_classifier import EmbeddingIntentClassifier
from app.nlu.entity_extractor import EntityExtractor
from app.commons.db import *

model_updated_signal = my_signals.signal('model-updated')


def train_models():
    # generate intent classifier training data
    intents = dbGetTable("intent")
    if not intents:
        raise Exception("NO_DATA")
    # train intent classifier on all intents
    train_intent_classifier(intents)
    # train ner model for each Stories
    for intent in intents:
        train_all_ner(str(intent["intentId"]), intent["training"])
    model_updated_signal.send(app, message="Training Completed.")


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
    intent_classifier = EmbeddingIntentClassifier(use_word_vectors=app.config['USE_WORD_VECTORS'])
    intent_classifier.train(X, y)
    intent_classifier.persist(model_dir=app.config["MODELS_DIR"])


def train_all_ner(story_id, training_data):
    entityExtraction = EntityExtractor()
    # generate crf training data
    ner_training_data = entityExtraction.json2crf(training_data)
    # train and store ner model
    entityExtraction.train(ner_training_data, story_id)


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
