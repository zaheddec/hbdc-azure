import json, sys, os, time, datetime
import pandas as pd

# you need 2 folders:
# RawTweets - json files from streamer + a process_log.txt - keeps track of json that has been processed by this script, and will skip those files. 
# FilterTweets - json files that has been filtered out

# use this to call from shell 
#keywords = sys.argv[1:]

keywords = ['hiking', 'working', 'slept well']

# Find all json files
json_files = [x for x in os.listdir(os.getcwd()+'/RawTweets') if x.endswith(".json")]

# load log of all processed files
donelist = []
f = open('RawTweets/process_log.txt', 'r')
for line in f:
	if line != '\n':
		donelist.append(line.rstrip('\n'))





# if json files is in log file, skip it
# and skip if file was modified less than 5 mins (in case streamer still dumping into it)
to_do = [x for x in json_files if x not in donelist and time.time() - os.path.getmtime('RawTweets/'+ x) > 5*60]




####################
# grab tweets with correct keywords
# put in a keyword_tweets.json 
####################
tweets = []
for i, item in enumerate(to_do):

	f = open('RawTweets/' + item, 'r')
	
	for line in f:
		#print line

		if line != '\n':
			# HANDLING TWEET WITHOUT TEXT FIELD HERE
			tweet = json.loads(line)
			if 'text' in tweet:
				#print 'YAY'

				if any(x for x in keywords if x in tweet['text']) and tweet['place']['country_code'] == 'CA':
					
					print [x for x in keywords if x in tweet['text']]
					print tweet['place']['country_code']
					print tweet['text'] + '\n' + '\n'

					tweets.append(line)

			else:
				#print 'NO' + '\n' + '\n'
	
	donelist = donelist + [item]


now = datetime.datetime.utcnow().strftime("%Y.%m.%d.%H.%M")
f = open('FilteredTweets/%s_tweets_%s.json' %('_'.join(keywords).replace(' ','.'),now), 'a')
for item in tweets:
	f.write(item)
f.close()


# save log file
f = open('RawTweets/process_log.txt', 'w')
for item in donelist:
	f.write(item + '\n')
f.close()


