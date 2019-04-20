import logging, colorlog
from colorlog import ColoredFormatter


def formatLogger(type):
    """Return a logger with a default ColoredFormatter."""
    formatter = ColoredFormatter(
        # "%(log_color)s%(levelname)-8s%(reset)s %(blue)s%(message)s",
        "[  %(log_color)s%(levelname)s%(reset)s  ] [%(name)s] => %(funcName)s : %(asctime)s : %(message)s",
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
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger