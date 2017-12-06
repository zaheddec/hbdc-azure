import json
import csv
import pandas as pd
import glob
from tqdm import tqdm
from geopy.geocoders import Nominatim
from geopy.distance import vincenty
import geocoder
import re

from nltk.stem.porter import PorterStemmer
from nltk.stem.snowball import FrenchStemmer
from googletrans import Translator

translator = Translator()
porter = PorterStemmer()
FrenchStem = FrenchStemmer()

"""
To be filtered, a tweet has to contain a noun + verb in one of the lists
"""

# Sedentary behavior keywords
sedentary_verbs = ['watch', 'chill', 'work', 'study', 'lying', 'recline', 'sit\s', 'read\s', 'draw', 'paint'
        , 'drive']

sedentary_nouns = ['game', 'video game', 'school', 'office', 'television', 'tv', 
         'computer', 'phone', 'iphone', 'tablet', 'ipad', 'kindle', 'book', 
         'newspaper', 'homework', 'car\s', 'plane', 'bus', 'train', 'netflix',
         'bed', 'the play', 'the show'] 

sedentary_leagues = ['nba', 'worldseri', 'nfl', 'mls', 'baseball', 'mlb', 'soccer'
                     , 'mls', 'ufc', 'nhl', 'cfl']
sedentary_exclusion = ['look for work', 'hire', 'job', 'career', 'Job', 'Hire', 'hiring', 'Hiring'] 
sedentary_verbs_stemmed = [porter.stem(item) for item in sedentary_verbs]
sedentary_verbs_fr = [translator.translate(x, dest='fr').text for x in sedentary_verbs]
sedentary_nouns_fr = [translator.translate(x, dest='fr').text for x in sedentary_nouns]
sedentary_exclusion_fr = [translator.translate(x, dest='fr').text for x in sedentary_exclusion]
sedentary_verbs_stemmed_fr = [FrenchStem.stem(item) for item in sedentary_verbs]

sedentary_exclusion_regex = "\s(" + '|'.join(sedentary_exclusion + sedentary_exclusion_fr) + ')'
sedentary_nouns_regex = "\s(" + '|'.join(sedentary_nouns + sedentary_nouns_fr + sedentary_leagues) + ')'
sedentary_verbs_regex = "\\b(" + '|'.join(sedentary_verbs + sedentary_verbs_stemmed + sedentary_verbs_fr + sedentary_verbs_stemmed_fr) + ')'

sedentary_pattern = r'^(?=.*(?:%s))(?!.*(?:%s))(?=.*%s).*$' % (sedentary_nouns_regex + '|' + sedentary_verbs_regex, sedentary_exclusion_regex, '') # sedentary_verbs_regex)

# physical activity keywords
activity_verbs = ['play', 'train', 'run', 'hike', 'ski', 'bike', 'lift']
activity_nouns = [ 'gym', 'workout', 'work out', 'basketball', 'basket ball'
                  ,'hockey', 'biking', 'bball', 'baseball', 'climb', 'dance', 'dancin'
                  ,'skate', 'skating', 'squat', 'weights', 'gains', 'volleyball', 'yoga'
                 , 'park', 'mountain'] 

with open('./Tweets_keywords/sportslist.txt') as f:
    lines = f.readlines()

sports = [x.lower().replace('\n', '') for x in lines if x.lower() not in activity_nouns] # removed 3 duplicates
activity_exclusion = ['look for work', 'hire', 'job', 'career', 'game', 'watch', 'attend']
activity_verbs_stemmed = [porter.stem(item) for item in activity_verbs]

physical_exclusion_regex = "\s(" + '|'.join(activity_exclusion) + ')'
physical_nouns_regex = "\s(" + '|'.join(activity_nouns + sports) + ')'

temp = re.sub('a.k.a','',physical_nouns_regex)
temp = re.sub('\.','', temp)
temp = re.sub('/','',temp)
temp = re.sub('\[','',temp)
temp = re.sub('\]','',temp)

physical_nouns_regex = temp


physical_verbs_regex = "\\b(" + '|'.join(activity_verbs + activity_verbs_stemmed) + ')'

physical_activity = r'^(?=.*(?:%s))(?!.*(?:%s))(?=.*%s).*$' % (physical_nouns_regex + '|' + physical_verbs_regex, physical_exclusion_regex, '') # physical_verbs_regex)

# sleep keywords
sleep_verbs = ['sleep', 'nap\s', 'rest\s', 'zzz.?\s', 'pass out', 'get up', 'wake up'
               , 'asleep', 'slept']
sleep_verbs_stemmed = [porter.stem(item) for item in sleep_verbs]
sleep_nouns = ['bed', 'night', 'last night', 'today', 'sack', 'morning', 'insomnia', 'dodo', 'zzz', 'siesta', 'tired'] 
sleep_exclusion = ['restaurant']

sleep_verbs_regex = "\s(" + '|'.join(sleep_verbs + sleep_verbs_stemmed) + ')'
sleep_nouns_regex = "\s(" + '|'.join(sleep_nouns) + ')'
sleep_exclusion_regex = "\s(" + '|'.join(sleep_exclusion) + ')'

sleeping_pattern = r'^(?=.*(?:%s))(?!.*(?:%s))(?=.*%s).*$' % (sleep_nouns_regex + '|' + sleep_verbs_regex, sleep_exclusion_regex, '')#, sleep_verbs_regex)


'''
Converts a folder of tweets in json format to a single csv file
'''
def tweet_folder_json_to_csv(tweet_folder, out_path):
    fnames = glob.glob(tweet_folder + '*.json')

    data_json = []
    for tweets_path in tqdm(fnames):
        with open(tweets_path, mode='r') as f:
            data_json += f.readlines()

    data_python = []

    for tweet in tqdm(data_json):
        try:
            tweet_json = json.loads(tweet)
            if filter_tweet(tweet_json):
            	data_python.append(tweet_json)
        except:
            print("Bad json:", tweet)

    csv_out = open(out_path, mode='w')
    writer = csv.writer(csv_out)

    fields = ['created_at', 'text', 'screen_name',
              'hashtags',
              'placename', 'city','province', 'country', 'latitude', 'longitude']
    writer.writerow(fields)


    for line in tqdm(data_python):
        # Writes a row and gets the fields from the json object
        if line.get('place'):
            writer.writerow([line.get('created_at'),
                         line.get('text').encode('unicode_escape'), #unicode escape to fix emoji issue
                         line.get('user').get('screen_name'),
                         ','.join([i['text'] for i in line.get('entities').get('hashtags')]),
                         line.get('place').get('full_name'),
                         line.get('place').get('name'),
                         line.get('place').get('full_name').split(', ')[-1],
                         line.get('place').get('country'),
                         line.get('geo').get('coordinates')[0] if line.get('geo') else '',
                         line.get('geo').get('coordinates')[1] if line.get('geo') else ''])

    csv_out.close()

'''
Returns true if a tweet should be kept
'''
def filter_tweet(tweet_json):
    if not tweet_json.get('place'):
        return False
    country = tweet_json.get('place').get('country')
    if country != 'Canada':
        return False

    return True

    re_pattern = '|'.join([sedentary_behavior, sleeping_pattern, physical_activity])
    text_result = re.search(re_pattern, line.get('text').encode('unicode_escape'))
    hashtags = ','.join([i['text'] for i in line.get('entities').get('hashtags')])
    hashtag_result = re.search(re_pattern, hashtags)

'''
Counts the number of hashtags and text that match a regular expression
'''
def count_topic(x, regex):
    hashtags = sum(x['hashtags'].str.contains(regex) == True)
    text = sum(x['text'].str.contains(regex) == True)
    return hashtags + text

'''
Computes features from a twitter data frame
'''
def filter_tweets(x):
    return pd.Series(dict(num_tweets = x['text'].count(),
                          physical_activity = count_topic(x, physical_activity),
                          sedentary_behavior = count_topic(x, sedentary_pattern),
                          sleeping = count_topic(x, sleeping_pattern),
                          latitude = x['latitude'].mean(),
                          longitude = x['longitude'].mean()))


'''
Compute geolocations for all regions
Uses geopy
'''
def compute_geolocation_regions(regions_df):
    geopy_geocoder = Nominatim()
    for region in regions_df.index.tolist():
        if pd.isnull(regions_df.loc[region].latitude):
            geolocation = geopy_geocoder.geocode(region, timeout=10)
            if geolocation:
                latitude = geolocation[-1][0]
                longitude = geolocation[-1][1]
                if pd.isnull(regions_df.loc[region].latitude):
                    regions_df.loc[region].latitude = latitude
                    regions_df.loc[region].longitude = longitude
                else:
                    print("Couldn't locate", region)

'''
Compute geolocations for all regions
Uses geocoder
'''
def compute_geolocation_regions_geocoder(regions_df):
    for idx, region in tqdm(enumerate(regions_df.index.tolist())):
        if pd.isnull(regions_df.loc[region].latitude):
            g = geocoder.google(region)
            if g:
                latitude = g.latlng[0]
                longitude = g.latlng[1]
                regions_df.loc[region].latitude = latitude
                regions_df.loc[region].longitude = longitude
            else:
                print('Couldnt locate', region)

'''
Returns the index of the closest city given a latitude/longitude position
'''
def find_closest_city(lat, long, mapcities_df):
    distances = mapcities_df.dropna().apply(
        lambda row: vincenty((lat, long), (row.latitude, row.longitude)).km, axis=1)
    return distances.idxmin()
    closest = mapcities_df.loc[distances.idxmin()]
    return closest
