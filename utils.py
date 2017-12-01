import json
import csv
import pandas as pd
import glob
from tqdm import tqdm
from geopy.geocoders import Nominatim
from geopy.distance import vincenty
import geocoder
import re


sedentary_pattern = r'working|work|watch|chill|games|travail'
sleeping_pattern = r'sleep|slept|dorm|dodo'
physical_activity = r'run|hiking|hike|courir|gym|train|workout|work out|'

sedentary_pattern = r'working|work|watch|chill|games|movies|nba|ufc|nhl|nfl|cfl'
sleeping_pattern = r'sleep|slept|insomnia|dormir|dodo|rest|nap|zzz|siesta'

physical_incl = 'run|hiking|hike|courir|gym|train|workout|work out|basketball| \
                 ball|hockey|biking|bike|bb|bball|baseball|climb|dance|dancin|ran| \
                 skate|skating|squat|lift|gains|volleyball|yoga'

physical_excl = 'watch|attend'
physical_activity = r'^(?=.*(?:%s))(?!.*(?:%s)).*$' % (physical_incl, physical_excl)


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
