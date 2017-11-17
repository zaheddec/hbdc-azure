import geocoder
import pandas as pd

cities = pd.read_csv('./Canadian territory Ids.csv')

latitude = []
longitude = []
for i in range(len(cities)):
    query = ', '.join([cities.loc[i].division_name, cities.loc[i].province_name])
    geolocation = geocoder.google(query)
    if not geolocation:
        print("Couldn't find", query)
        latitude.append('')
        longitude.append('')
    else:
        print(i, query, geolocation.latlng[0], geolocation.latlng[1])
        latitude.append(geolocation.latlng[0])
        longitude.append(geolocation.latlng[1])
        #lat_long.append((geolocation.latitude, geolocation.longitude))

cities['latitude'] = pd.Series(latitude)
cities['longitude'] = pd.Series(longitude)

cities.to_csv('canadian_territories_test.csv')
