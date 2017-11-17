####################
# Import
# https://github.com/GeneralMills/pytrends
####################
from pytrends.request import TrendReq

import datetime, time

####################



####################
# Build Payload + set search parameter
####################


# search keywords, max 5, as a list of strings
# Possible values for window: 'now 1-H', 'now 4-H', 'now 1-d', 'now 7-d', 'today 3-m', 'today 5-y', 'all'
def get_data(keyword, window='all', where='CA'):

	today = datetime.datetime.utcnow().strftime("%Y.%m.%d")
	now = datetime.datetime.utcnow().strftime("%Y.%m.%d.%H.%M")

	pytrend = TrendReq(hl='en-US', tz=240)

	pytrend.build_payload(kw_list=keyword, geo=where, timeframe=window)

	filenames = dict([ ('now 1-H', '1hrfrom'), ('now 4-H', '4hrsfrom'), ('now 1-d', '1dayfrom'), ('now 7-d', '7daysfrom'), ('today 3-m', '3mosfrom'), ('today 5-y', '5yrsfrom'), ("all", '2004to')])

	print keyword, window, where

	if window in ['now 1-H', 'now 4-H']:
		try:
			interest_over_time = pytrend.interest_over_time()

			interest_over_time.to_csv('Trends/%s' %('_'.join(keyword) + 'TS') + filenames[window] + now + '.csv', encoding='utf-8')
		except:
			print 'Cannot get interest_over_time ' + window
	
		try:
			interest_by_region = pytrend.interest_by_regionv2(resolution='REGION')
			interest_by_region.to_csv('Trends/%s' %('_'.join(keyword)  + 'PROVINCES') + filenames[window] + now + '.csv', encoding='utf-8')
		except:
			print 'Cannot get interest_by_region ' + window


		try:
			interest_by_city = pytrend.interest_by_regionv2(resolution='CITY')
			interest_by_city.to_csv('Trends/%s' %('_'.join(keyword)  + 'CITY') + filenames[window] + now + '.csv', encoding='utf-8')
		except:
			print 'Cannot get interest_by_city ' + window


		try:
			top_queries = pytrend.related_queries()[keyword]['top']
			top_queries.to_csv('Trends/%s' %('_'.join(keyword)  + 'TOPQUERIES') + filenames[window] + now + '.csv', encoding='utf-8')
		except:
			print 'Cannot get top_queries ' + window


		try:
			rising_queries = pytrend.related_queries()[keyword]['rising']
			rising_queries.to_csv('Trends/%s' %('_'.join(keyword)  + 'RISINGQUERIES') + filenames[window] + now + '.csv', encoding='utf-8')
		except:
			print 'Cannot get rising_queries ' + window


	else:

		try:
			interest_over_time = pytrend.interest_over_time()
			#print interest_over_time
			interest_over_time.to_csv('Trends/%s' %('_'.join(keyword)  + 'TS') + filenames[window] + today + '.csv', encoding='utf-8')
		except:
			print 'Cannot get interest_over_time ' + window


		try:
			interest_by_region = pytrend.interest_by_regionv2(resolution='REGION')
			interest_by_region.to_csv('Trends/%s' %('_'.join(keyword)  + 'PROVINCES') + filenames[window] + today + '.csv', encoding='utf-8')
		except:
			print 'Cannot get interest_by_region ' + window


		try:
			interest_by_city = pytrend.interest_by_regionv2(resolution='CITY')
			interest_by_city.to_csv('Trends/%s' %('_'.join(keyword)  + 'CITY') + filenames[window] + today + '.csv', encoding='utf-8')
		except:
			print 'Cannot get interest_by_city ' + window


		try:
			top_queries = pytrend.related_queries()[keyword]['top']
			top_queries.to_csv('Trends/%s' %('_'.join(keyword)  + 'TOPQUERIES') + filenames[window] + today + '.csv', encoding='utf-8')
		except:
			print 'Cannot get top_queries ' + window


		try:
			rising_queries = pytrend.related_queries()[keyword]['rising']
			rising_queries.to_csv('Trends/%s' %('_'.join(keyword)  + 'RISINGQUERIES') + filenames[window] + today + '.csv', encoding='utf-8')
		except:
			print 'Cannot get rising_queries ' + window


def all_window(keyword):
	for item in ['now 1-H', 'now 4-H', 'now 1-d', 'now 7-d', 'today 3-m', 'today 5-y', 'all']:
		get_data(keyword, window=item, where='CA')



####################




###################
# Duplicate get_date for compare keywords and find which is max
###################
# interest overtime only
# Possible values for window: 'now 1-H', 'now 4-H', 'now 1-d', 'now 7-d', 'today 3-m', 'today 5-y', 'all'
def compare(keyword, window='all', where='CA'):

	today = datetime.datetime.utcnow().strftime("%Y.%m.%d")
	now = datetime.datetime.utcnow().strftime("%Y.%m.%d.%H.%M")

	pytrend = TrendReq(hl='en-US', tz=240)

	pytrend.build_payload(kw_list=keyword, geo=where, timeframe=window)

	filenames = dict([ ('now 1-H', '1hrfrom'), ('now 4-H', '4hrsfrom'), ('now 1-d', '1dayfrom'), ('now 7-d', '7daysfrom'), ('today 3-m', '3mosfrom'), ('today 5-y', '5yrsfrom'), ("all", '2004to')])

	print keyword, window, where

	if window in ['now 1-H', 'now 4-H']:
		try:
			interest_over_time = pytrend.interest_over_time()
			
			interest_over_time.to_csv('Trends/%s' %('_'.join(keyword) + 'TS') + filenames[window] + now + '.csv', encoding='utf-8')
		except:
			print 'Cannot get interest_over_time ' + window
	

	else:

		try:
			interest_over_time = pytrend.interest_over_time()
			
			interest_over_time.to_csv('Trends/%s' %('_'.join(keyword)  + 'TS') + filenames[window] + today + '.csv', encoding='utf-8')
		except:
			print 'Cannot get interest_over_time ' + window

	return interest_over_time




###################



















