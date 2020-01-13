# Muse-Navi :sparkles:
Muse-Navi is a web application that lets you learn more about your favorite albums, tracks, and playlists.
It does this by graphing musical features extracted by Spotify.

# Local Setup
1. Create a Spotify account and login here https://developer.spotify.com/dashboard/.
2. Register the app by following the instructions here https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app. <b>Set the Redirect URI to be https://lvh.me:5000.</b>
3. Clone this repository.
4. In the repo's root directory, copy the contents of settings_template.py file into a new file called settings.py.
5. Replace the dummy client and secret keys with your own keys.
6. Set up a virtual environment and install the packages from requirements.txt.
7. Activate the virtual environment and run 
```
python views.py
```
7. Use the app by going to 127.0.0.1:5000.

# Tools
Lang: Python, JS, HTML5, CSS

Libs: Flask, Spotipy, Bootstrap, JQuery, Chartist.js, Chartist-plugin-axistitle, Chartist-plugin-legend
