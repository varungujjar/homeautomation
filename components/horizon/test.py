import time
from apscheduler.schedulers.background import BackgroundScheduler
 
REFRESH_INTERVAL = 60 #seconds
 
scheduler = BackgroundScheduler()
scheduler.start()
 
def main():
    # Call our function the first time
    myFunction()
 
    # then every 60 seconds after that.
    scheduler.add_job(myFunction, 'interval', seconds = REFRESH_INTERVAL)
 
    # main loop
    while True:
        time.sleep(1)
 
def myFunction():
    print "Calling this fucntion every %d seconds" % REFRESH_INTERVAL
 
if __name__ == "__main__":
    main()