"""
Module containing methods to help parse 
requests as well as responses from 
the api calls to Spotify.
"""

def process_user_query(data):
    """
    Takes user-supplied data from the search form and converts
    it into a query string for the search api call
    """ 
    query = ''
    resp_type = data['retRadios'].lower()
    
    query = query + 'artist:{} '.format(data['artist']) if data['artist'] != '' else query 
    query = query + 'album:{} '.format(data['album']) if data['album'] != '' else query 
    query = query + 'track:{} '.format(data['track']) if data['track'] != '' else query
    query = query + 'genre:{} '.format(data['genre']) if data['genre'] != '' else query
    query = query + 'year:{} '.format(data['year'])if data['year'] != '' else query
    query = query + 'playlist:{} '.format(data['year']) if data['playlist'] != '' else query
     
    return query, resp_type

def process_search(resp, resp_type):
    """
    Handler for parsing the data returned by search query to Spotify.
    """
    if resp_type == 'album':
        return process_search_album(resp)
    elif resp_type == 'track':
        return process_search_track(resp)
    else:
        return process_search_playlist(resp)

def process_search_album(resp):
    """
    Parses information about albums returned in the response
    and returns useful values as a list of dictionaries.
    """
    albums = resp['albums']['items']
    resp = []
    for album in albums:
        data = {}
        data['link'] = album['external_urls']['spotify']
        data['cover'] = album['images'][0]['url']
        data['name'] = album['name']
        data['release_date'] = album['release_date']
        data['artists'] = {}
        for artist in album['artists']:
            data['artists']['name'] = artist['name']
            data['artists']['link'] = artist['external_urls']['spotify']
        resp.append(data) 
    return resp

def process_search_track(resp):
    """
    Parses information about tracks returned in the response
    and returns useful values as a list of dictionaries.
    """
    tracks = resp['tracks']['items']
    resp = []
    for track in tracks:
        data = {}
        data['link'] = track['external_urls']['spotify']
        data['cover'] = track['album']['images'][0]['url']
        data['name'] = track['name']
        data['album_name'] = track['album']['name']
        data['album_link'] = track['album']['external_urls']['spotify']
        data['artists'] = []
        for artist in track['album']['artists']:
            art = {}
            art['name'] = artist['name']
            art['link'] = artist['external_urls']['spotify']
            data['artists'].append(art)
        resp.append(data) 
    return resp


def process_search_playlist(resp):
    """
    Parses information about playlists returned in the response
    and returns useful values as a list of dictionaries.
    """
    playlists = resp['playlists']['items']
    resp = []
    for playlist in playlists:
        data = {}
        data['link'] = playlist['external_urls']['spotify']
        data['owner'] = playlist['owner']['display_name']
        data['owner_link'] = playlist['owner']['external_urls']['spotify']
        data['description'] = playlist['description']
        data['cover'] = playlist['images'][0]['url']
        data['name'] = playlist['name']
        resp.append(data) 
    return resp

def _millisToMinSec(millis):
    minutes = int(millis/60000)
    seconds = (millis%60000)//1000
    if seconds >= 60:
        minutes += 1
        seconds -= 60
    if seconds == 0:
        return '{} min'.format(minutes)
    else:
        return '{} min and {} sec'.format(minutes, seconds)

def process_features(data):
    """
    Changes the format of the features of a track(s)
    """
    keys = [-1,0,1,2,3,4,5,6,7,8,9,10,11]
    pitches = ['N/A','C','C♯/D♭','D','D♯/E♭','E','F','F♯/G♭','G','G♯/A♭','A','A♯/B♭','B']
    key_pitches = dict(zip(keys, pitches))
    for i in range(len(data)):  
        data[i]['duration_ms'] = _millisToMinSec(data[i]['duration_ms'])
        data[i]['key'] =  key_pitches[data[i]['key']]
        data[i]['time_signature'] = '{}/4'.format(data[i]['time_signature'])
        data[i]['mode'] = 'major' if data[i]['mode'] == 1 else 'minor'
