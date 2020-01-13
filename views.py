# External
from flask import Flask, request, render_template, url_for, abort, jsonify
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# standard
import json

# Internal
import settings
import parser

app = Flask(__name__)

# Auth setup
# Spotify API Instance
sp = None

def get_spotify_instance():
    """
    Returns spotify instance to interface with api.
    """
    # Auth setup
    c_id = settings.client_id
    c_sec = settings.client_secret
    # Setup the instance
    ccm = SpotifyClientCredentials(client_id=c_id, client_secret=c_sec)
    sp = spotipy.Spotify(client_credentials_manager=ccm)
    return sp

@app.route('/', methods=['GET'])
def hello():
    print('requesting home')
    return render_template('home.html')

@app.route('/feature', methods=['POST'])
def feature():
    global sp
    
    if sp is None:
        try:
            sp = get_spotify_instance()    
        except Exception as e:
            abort(500) 
     
    # Build the Search
    print(request.form)
    data = request.form

    try:
        link = data['result']
        resp_type = data['respType'].lower()
    except KeyError as e:
        print(e)
        return {'errors': str(e)}
    
    try:
        if resp_type == 'album':
            # Get audio features of all tracks in the album
            tracks = sp.album_tracks(link)
            links = [tracks['items'][i]['external_urls']['spotify'] for i in range(len(tracks['items']))]
            resp = sp.audio_features(links)
        elif resp_type == 'track':
            # Get audio features from a single track
            resp = sp.audio_features(link)
        elif resp_type == 'playlist':
            # TODO Get audio features of all tracks in the playlist
            results = sp.user_playlist(None, link, fields='tracks')
            tracks = results['tracks']
            links = [tracks['items'][i]['track']['external_urls']['spotify'] for i in range(len(tracks['items']))]
            resp = sp.audio_features(links)
        else:
            raise ValueError('resource type is not one of album, track \
                                or playlist.', 'resp_type: ' + resp_type)
        # copy over info into a new ds
        data = {}
        for i in range(len(resp)):
            data[i] = {}
            for key, val in resp[i].items():
                if key not in settings.keys_to_ignore:
                    data[i][key] = val
        # change formatting for some keys
        if resp_type == 'track':
            parser.process_features(data)
        return jsonify(data)      
    except ValueError as e:
        print(e)
        return {'errors': str(e)}
    except KeyError as e:
        print('KeyError in /feature when parsing response: {}'.format(e))
        return {'errors': str(e)}
    except Exception as e:
        print('something happened when querying spotify\n{}'.format(e))
        return {'errors': str(e)} 

@app.route('/query', methods=['POST'])
def query():
    global sp
    # Build the Search
    print(request.form)
    try:
        query, resp_type = parser.process_user_query(request.form) 
        print(query)
    except ValueError as e:
        print(e)
        return {'errors': str(e)}    
    
    if sp is None:
        try:
            sp = get_spotify_instance()    
        except Exception as e:
            abort(500) 
    
    try:
        resp = sp.search(q=query, type=resp_type, limit=50)
         # Process response
        data = parser.process_search(resp, resp_type)
        print('data: {}'.format(data))
        return jsonify(data)
    except Exception as e:
        print(e)
        return {'errors': str(e)}

@app.route('/search', methods=['GET'])
def search():
    global sp
    
    if sp is None:
        try:
            sp = get_spotify_instance()
        except Exception as e:
            abort(500)        
    
    return render_template('search.html') 

if __name__ == '__main__':
    app.run()
