

from __future__ import division
import math, time

execfile('gtrends.py')


# provide your test keywords here
test_set = ['watch', 'watching', 'watches', 'watched', 'chilling', 'working', 'games', 'video games', 'can\'t sleep', 'insomnia', 'melatonin', 'Ambien', 'AmbienCR', 'zolpidem', 'Lunesta', 'Intermezzo', 'trazadone', 'eszopiclone', 'cant sleep']





AUC = []

first_set = [x for i, x in enumerate(test_set) if i <= 4]
print first_set

DF = compare(first_set)
print '\n'

# Sampling frequency is constant, so assumed that the difference between x1, x2 = 1 unit 
AUC = [x for i, x in enumerate(DF.sum(axis=0)) if i <=4 and i < (len(DF.sum(axis=0))-1)]

# which word is max
max_index = AUC.index(max(AUC))

keep = first_set[max_index]

if len(test_set) >5:
	for j in range(2, int(math.ceil((len(test_set) - 5) /4))+2 ):
		next_set = [x for i, x in enumerate(test_set) if i <= 4*j and i > 4*(j-1)]

		next_set = [keep] + next_set
		print next_set 


		DF = compare(next_set)
		print '\n'

		# Sampling frequency is constant, so assumed that the difference between x1, x2 = 1 unit 
		AUC = [x for i, x in enumerate(DF.sum(axis=0)) if i <=4 and i < (len(DF.sum(axis=0))-1)]

		# which word is max
		max_index = AUC.index(max(AUC))

		keep = next_set[max_index]

		time.sleep(5)

	print '\n' + 'Winner: ' + str(keep)



# subset of <=4 words

# For each iteration
# calculate area under the curve
# find the max area/keyword
# hold max keyword for next iteration
# use the next 3 keywords
# repeat until end of list

get_data(['watch', 'watching', 'watches', 'watched', 'chilling',],  window='all', where='CA')















