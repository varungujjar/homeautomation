class Config(object):
    DEBUG = False
    MODELS_DIR = "model_files/"
    INTENT_MODEL_NAME = "intent.model"
    DEFAULT_FALLBACK_INTENT_NAME = "fallback"
    DEFAULT_WELCOME_INTENT_NAME = "init_conversation"
    USE_WORD_VECTORS = True


class Development(Config):
    DEBUG = True

class Production(Config):
    # Web Server details
    WEB_SERVER_PORT = 8001
