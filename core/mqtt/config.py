from helpers.db import *

CONFIG = {
        'keep_alive': int(getParmeters("mqtt","keepalive")),
        'ping_delay': 2,
        'default_qos': int(getParmeters("mqtt","qos")),
        'default_retain': False,
        'auto_reconnect': getParmeters("mqtt","autoreconnect"),
        'reconnect_max_interval':int(getParmeters("mqtt","reconnectinterval")),
        'reconnect_retries': int(getParmeters("mqtt","reconnectretries"))
}
