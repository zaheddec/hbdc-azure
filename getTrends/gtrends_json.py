from pytrends.request import TrendReq

import datetime, time, json
import pandas as pd

#test 
# use as: output = get_all_json(['hiking'])
# output is a multi-level nested dict. It contains all data from all time windows and geographic locations

# output.keys()
# ['created_at', 'data', 'keyword']

# output['data'].keys()
# ['overtime', 'overgeo']

# use .keys() to get subsequent keys

def get_DF(keyword, window='all', where='CA'):

	pytrend = TrendReq(hl='en-US', tz=240)

	pytrend.build_payload(kw_list=keyword, geo=where, timeframe=window)

	print keyword, window, where

	interest_over_time = pd.DataFrame()
	interest_by_region = pd.DataFrame()
	interest_by_city = pd.DataFrame()
	top_queries = pd.DataFrame()
	rising_queries = pd.DataFrame()

	try:
		interest_over_time = pytrend.interest_over_time()
	except:
		print 'Cannot get interest_over_time ' + window

	try:
		interest_by_region = pytrend.interest_by_regionv2(resolution='REGION')
	except:
		print 'Cannot get interest_by_region ' + window


	try:
		interest_by_city = pytrend.interest_by_regionv2(resolution='CITY')
	except:
		print 'Cannot get interest_by_city ' + window


	try:
		top_queries = pytrend.related_queries()[keyword]['top']
	except:
		print 'Cannot get top_queries ' + window


	try:
		rising_queries = pytrend.related_queries()[keyword]['rising']
	except:
		print 'Cannot get rising_queries ' + window

	return interest_over_time, interest_by_region, interest_by_city, top_queries, rising_queries

# test
#TS, province, city, related, trending = get_DF(['hiking'])


def get_all_json(listof1keyword): # ['hiking']
	
	keyword = [listof1keyword[0]]

	now = datetime.datetime.utcnow().strftime("%Y%m%d%H%M")

	filenames = dict([ ('now 1-H', '1hrfrom'), ('now 4-H', '4hrsfrom'), ('now 1-d', '1dayfrom'), ('now 7-d', '7daysfrom'), ('today 3-m', '3mosfrom'), ('today 5-y', '5yrsfrom'), ("all", '2004to')])

	innerTS = {}
	innerGeo = {}
	
	for i, item in enumerate(['now 1-H', 'now 4-H', 'now 1-d', 'now 7-d', 'today 3-m', 'today 5-y', 'all']):
		
		TS, province, city, related, trending = get_DF(keyword, window = item)

		### Over time
		TS.columns = ['timeseries', 'isPartial']

		temp = {}
		temp = dict((str(k),v) for k, v in TS['timeseries'].to_dict().items())
		temp

		innerTS[filenames[item]] = temp

		#### Over Geo
		province.columns = ['province']
		city.columns = ['city']

		temp = {}
		temp['province'] = province.to_dict()['province']
		temp['city'] = city.to_dict()['city']

		innerGeo[filenames[item]] = temp

	layer2 = {} # list of layers 2
	layer2['overtime'] = innerTS
	layer2['overgeo'] = innerGeo

	layer3 = {}
	layer3['keyword'] = keyword[0]
	layer3['created_at'] = now
	layer3['data'] = layer2

	
	return layer3


#test 
output = get_all_json(['hiking'])