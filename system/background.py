import asyncio, json
from system.events import *
from system.status import *

logger = formatLogger(__name__)

COMPONENTS_DIR = "components"


async def startBackgroundProcesses(loop):
        logger.info("Starting Background Processes")
        path = "./"+COMPONENTS_DIR
        componentsList = self.getList(path)
        for component in componentsList:
            fileList = os.listdir(path+"/"+component)
            if "server.py" in fileList:
                buildComponentPath = COMPONENTS_DIR+"."+component+".server"
                sys.path.append(path+"/"+component)
                importModule = __import__(buildComponentPath, fromlist="*")
                functionCall = getattr(importModule, "%sHandler" % component)()
                loop.create_task(functionCall)
        loop.create_task(eventsHandlerTimer())
        loop.create_task(statusHandler())
        await asyncio.sleep(1)

