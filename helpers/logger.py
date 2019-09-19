import logging, colorlog
from colorlog import ColoredFormatter


def formatLogger(type):
    
    

    formatter = ColoredFormatter(
        # "%(log_color)s%(levelname)-8s%(reset)s %(blue)s%(message)s",
        "[ %(log_color)s%(levelname)s%(reset)s ] [ %(asctime)s ] [%(name)s] => %(funcName)s : %(message)s",
        datefmt="%a %Y-%m-%d %H:%M:%S",
        reset=True,
        log_colors={
            'DEBUG':    'white',
            'INFO':     'green',
            'WARNING':  'yellow',
            'ERROR':    'red',
            'CRITICAL': 'red',
        }
    )
    
    logger = logging.getLogger(type)
    if not logger.handlers:
        logger.propagate = 0
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        return logger