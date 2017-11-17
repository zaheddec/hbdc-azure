#Import the necessary methods from tweepy library
from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream
import sys, os, time, datetime, json


#Variables that contains the user credentials to access Twitter API 
access_token = "1969348759-cSBoFcNzP9uNqlkTWjXTHNwqSVxpFQgx7bi9E5f"
access_token_secret = "qBA15hWersfXZnl72d5BJEgtReL3AJC5RvEjPvNVSMdu5"
consumer_key = "fS304oeTDngBgEOvZWdipflzh"
consumer_secret = "vhJBVAwdQCAQPdSBxLZWRTZSjLunZKJCdGBPMGwR5TKBOKB6bn"



#This is a basic listener that just prints received tweets to stdout.
class StdOutListener(StreamListener):

    def on_data(self, data):
        print data
        return True

    def on_error(self, status):
        print status


####################
# Dont print the tweet
# load as it comes in
# filter out for geo-tagged in Canada
# save batches of 5 mins each in json format
# use shell script to automate search for multiple keywords
####################

class LimitListener(StreamListener):
    def __init__(self, time_limit=5*60):
        self.start_time = time.time()
        self.limit = time_limit
        
        now = datetime.datetime.utcnow().strftime("%Y.%m.%d.%H.%M.%s")
        
        #self.saveFile = open('RawTweets/%s_tws%s.json' %('_'.join(sys.argv[1:]).replace(' ','.'),now), 'a')
        
        #no keyword
        self.saveFile = open('RawTweets/%s_tws%s.json' %('Canada',now), 'a')

        super(LimitListener, self).__init__()

    def on_data(self, data):

        if (time.time() - self.start_time) < self.limit:
            self.saveFile.write(data)
            #self.saveFile.write('\n') # no need for extra space
            return True
        else:
            self.saveFile.close()
            return False

    def on_error(self, status):
        print status



'''
# save file every 5 mins
class KenListener(StreamListener):
    def __init__(self, time_refresh=5*60):
        self.start_time = time.time()
        self.limit = time_refresh
        
        now = datetime.datetime.utcnow().strftime("%Y.%m.%d.%H.%M.%s")
        self.saveFile = open('RawTweets/%s_tws%s.json' %('_'.join(sys.argv[1:]).replace(' ','.'),now), 'a')

        super(KenListener, self).__init__()

    def on_connect(self):
        # Called initially to connect to the Streaming API
        print("You are now connected to the streaming API.")
    
    def on_data(self, data):

        while time.time() - self.start_time < self.limit:
            self.saveFile.write(data)
            #return True

        self.saveFile.close()
        # open new file
        now = datetime.datetime.utcnow().strftime("%Y.%m.%d.%H.%M.%s")
        self.saveFile = open('RawTweets/%s_tws%s.json' %('_'.join(sys.argv[1:]).replace(' ','.'),now), 'a')
        #self.saveFile.write(data)

        print 'Saved ' + 'RawTweets/%s_tws%s.json' %('_'.join(sys.argv[1:]).replace(' ','.')) + '\n'

        self.start_time = time.time()    

    def on_error(self, status):
        print status

'''


####################

if __name__ == '__main__':

    for i in range(720*60/5): # change your max time for streamer here in mins/5
        
        #This handles Twitter authetication and the connection to Twitter Streaming API
        #l = StdOutListener()
        
        l = LimitListener()

        #l = KenListener(time_refresh=10)
        #l = KenListener()

        auth = OAuthHandler(consumer_key, consumer_secret)
        auth.set_access_token(access_token, access_token_secret)
        stream = Stream(auth, listener=l) #refresh frequency

        # Bounding box http://boundingbox.klokantech.com/
        # track and locations are OR per https://stackoverflow.com/questions/25739073/how-to-get-location-wise-tweets-using-tweepy-for-streaming-api
        
        #print 'stream for: ' + str(sys.argv[1:]) + ' ...' + str(i+1*5*60) + ' min(s)'

        # no keyword
        print 'stream for batch ' + str(i+1) + ' ...' + str((i+1)*5) + ' min(s) / ' + str((i+1)*5/60) + 'hrs'

        #geo only
        stream.filter(locations=[-140.625,49.0091,-46.9336,70.3187 # most of canada
        ,-95.2,45.14,-70.81,53.65 
        ,-83.18,42.68,-73.05,49.0
        ,-83.2562,41.5995,-77.2537,44.7011
        ,-80.8173,42.7211,-78.836,43.3508 # Niagara + Buffalo
        ,-82.38,45.03,-71.53,48.56
        ,-73.37,44.98,-67.76,49.46 # Quebec + Vermont
        ,-67.73,43.33,-40.9,49.26 # Atlantic islands
        ])



        #geo.filter(track= sys.argv[1:], languages=['en'])

   
        #stream.filter(track= sys.argv[1:], languages=['en'], locations=[-140.2734375,48.987427006,-54.84375,83.6185979676, -89.68, 48.29, -54.81, 49.04, -85.96, 47.56, -54.81, 48.31, -86.52, 40.98, -56.04, 56.41, -72.53, 34.98, -42.64, 59.18])

    #print sys.argv[1]

    #time.sleep(10)
    #stream.disconnect()


#ipython2 tweets.py 'hiking' 'working' 'slept well'




#import subprocess
#subprocess.call([sys.executable, 'abc.py', 'argument1', 'argument2'])

# Mongo DB
#http://pythondata.com/collecting-storing-tweets-with-python-and-mongodb/







