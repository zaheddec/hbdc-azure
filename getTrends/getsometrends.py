


execfile('gtrends_json.py')



keywords = ['hiking', 'sleep', 'video games']


for item in keywords:
	output = get_all_json([item])

	with open('%s_trend.json' %''.join(item.split()), 'w' ) as outfile:
		json.dump(output, outfile)