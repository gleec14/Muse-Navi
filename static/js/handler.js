"use strict";

// Globals
var cachedResponse = {};

// Card creation functions
// --------------------------------------------------------------
function createCard(id, cardData, cardType) {
    if (cardType == 'Album') {
        createCardAlbum(id, cardData);
    } else if (cardType == 'Track') {
        createCardTrack(id, cardData);
    } else {
        createCardPlaylist(id, cardData);
    }
}

function createCardAlbum(id, cardData) {
    var card = `
        <div class='card mb-2 mr-2' id=` + id + ` style='width: 15rem;'>
            <a href=`+ cardData['link'] +` target='_blank'>
                <img class='card-img-top' src=` + 
                    cardData['cover'] +`>
            </a>
            <div class='card-body'>
                <h5 class='card-title'>` + cardData['name'] + `</h5>
                <h6 class='card-subtitle mb-2 text-muted'>
                    <a href=`+ cardData['artists']['link'] + ` target='_blank'>` +
                            cardData['artists']['name'] + `</a>
                </h6>
                <p class='card-text'>`+ cardData['release_date'] + `</p>
            </div>
        </div>`;
    $('#slide').append(card);
}

function createCardTrack(id, cardData) {
    var card = `
        <div class='card mb-2 mr-2' id=` + id +` style='width: 15rem;'>
            <a href=`+ cardData['link'] +` target='_blank'>
                <img class='card-img-top' src=` + 
                    cardData['cover'] +`>
            </a>
            <div class='card-body'>
                <h5 class='card-title'>` + cardData['name'] + `</h5>
                <h6 class='card-subtitle mb-2 text-muted'>
                    <p>Album: <a href=` + cardData['album_link'] +` target='_blank'>` +
                        cardData['album_name'] + `</a></p>
                    <p>Artist(s): `; 
    for (var i = 0; i < cardData['artists'].length; i++) {
        card += `<a href=`+ cardData['artists'][i]['link'] + ` target='_blank'>` +
                            cardData['artists'][i]['name'] + `</a>. `
    }
    card +=     `   </p>
                </h6>
            </div>
        </div>`;
    $('#slide').append(card);
}

function createCardPlaylist(id, cardData) {
    var card = `
        <div class='card mb-2 mr-2' id=` + id + ` style='width: 15rem;'>
            <a href=`+ cardData['link'] +` target='_blank'>
                <img class='card-img-top' src=` + 
                    cardData['cover'] +`>
            </a>
            <div class='card-body'>
                <h5 class='card-title'>` + cardData['name'] + `</h5>
                <h6 class='card-subtitle mb-2 text-muted'>
                    <a href=` + cardData['owner_link'] + ` target='_blank'>` +
                        cardData['owner'] + `</a>
                </h6>
                <p class='card-text'>`+ cardData['description'] + `</p>
            </div>
        </div>`;
    $('#slide').append(card);
}


function createFeatureText(attr, val) {
    return '<p class="mb-1"><strong>' + attr + '</strong>: ' + val + '</p>';
}

function buildTrackFeatureModal(id, response) {
    for (var feature in response[0]) {
        $('#tfmText').append(createFeatureText(feature, response[0][feature]));
    }
}


// Functions that build the Graphs for the modal
// -----------------------------------------------------------------

function clearKeyGraphs(){ 
    $('#tfmKeyGraph').empty();
}

function clearFeatureGraphs() {
    $('#tfmFeatureLegend').empty();
    $('#tfmFeatureGraph').empty();
    $('#tfmFeatureGraph').off();
}

function buildFeatureGraphs(features) {
    clearFeatureGraphs();

    var label = [];
    // Create x-axis labels for each track in album
    for (var i = 0; i < features['key'].length; i++) {
        label.push((i+1));
    } 

    // Define graph parameters
    var feature_params = {
        targetId: 'tfmFeatureGraph',
        aspectRatio: 'ct-octave',
        label: label,
        hasNamedSeries: false,
        hasValLabel: false,
        data: [
            features['acousticness'],
            features['danceability'],
            features['energy'],
            features['instrumentalness'],
            features['liveness'],
            features['speechiness'],
            features['valence']
        ],
        id: 'chartFeature',
        hasOnlyInt: false,
        yMinSpace: 10,
        axisTitleX: 'Track Number',
        axisTitleY: 'Confidence / Degree',
        legendOptions: {
            legendNames: ['Acousticness', 'Danceability', 'Energy', 'Instrumentalness', 
                            'Liveness', 'Speechiness', 'Valence'],
            position: document.getElementById('tfmFeatureLegend')
        }
    };

    // Build the Graphs
    buildKeyGraphTemplate(feature_params);
}

function buildKeyGraphs(features) { 
    clearKeyGraphs();

    var label = [];
    for (var i = 0; i < features['key'].length; i++) {
        label.push((i+1));
    } 

    // Define graph parameters
    var key_params = {
        targetId: 'tfmKeyGraph',
        aspectRatio: 'ct-major-tenth',
        label: label,
        data: features['key'],
        id: 'chartKey',
        hasNamedSeries: true,
        chartName: 'key',
        hasValLabel: true,
        valLabel: {
            '-1': 'N/A',
            0: 'C',
            1: 'C♯/D♭',
            2: 'D',
            3: 'D♯/E♭',
            4: 'E',
            5: 'F',
            6: 'F♯/G♭',
            7: 'G',
            8: 'G♯/A♭',
            9: 'A',
            10: 'A♯/B♭',
            11: 'B'
        },
        hasOnlyInt: true,
        yMinSpace: 5,
        axisTitleX: 'Track Number',
        axisTitleY: 'Key',
        color: 'red',
        legendOptions: {}
    };
    var mode_params = {
        targetId: 'tfmKeyGraph',
        aspectRatio: 'ct-major-tenth', 
        label: label,
        data: features['mode'],
        id: 'chartMode',
        hasNamedSeries: true,
        chartName: 'mode',
        hasValLabel: true,
        valLabel: {
            0: 'minor',
            1: 'major'
        },
        hasOnlyInt: true,
        yMinSpace: 5,
        axisTitleX: 'Track Number',
        axisTitleY: 'Mode',
        color: 'blue',
        legendOptions: {}
    };

    // Build the Graphs
    buildKeyGraphTemplate(key_params);
    buildKeyGraphTemplate(mode_params);
}

function buildKeyGraphTemplate(params) {
    $('#'+params['targetId']).append(`<div class="ct-chart mt-2 `+ params['aspectRatio'] +`"  
                                    id=` + params['id'] + `><div>`);
    var series = [];
    if (params['hasNamedSeries'] == true) {
        series = [{name: params['chartName'], data: params['data']}];
    } else {
        series = params['data'];
    }
    
    var options = {
        chartPadding: {
            top: 20, bottom: 20,
            left: 20, right: 20
        },
        axisY: {
            scaleMinSpace: params['yMinSpace'],
            onlyInteger: params['hasOnlyInt'],
            labelInterpolationFnc: function(value) {
                if (params['hasValLabel']) {
                    return params['valLabel'][value]; 
                }
                return value;
            }
        }
    };

    var plugins = [
        /*
        Chartist.plugins.ctAccessibility({
            caption: 'Histogram of Key Signatures',
            seriesHeader: 'Key Signatures',
            summary: 'A graphic that shows the frequency to which a particular key is used in the album',          
        }),*/
        Chartist.plugins.ctAxisTitle({
            axisX: {
                axisTitle: params['axisTitleX'],
                axisClass: 'ct-axis-title',
                offset: {
                    x: 0,
                    y: 40
                },
                textAnchor: 'middle'
            },
            axisY: {
                axisTitle: params['axisTitleY'],
                axisClass: 'ct-axis-title',
                offset: {x:0, y:-3},
                textAnchor: 'middle',
                flipTitle: false
            }
        })
    ];

    if (Object.keys(params['legendOptions']).length > 0) {
        plugins.push(
            Chartist.plugins.legend(params['legendOptions'])
        );
    }
    
    options['plugins'] = plugins;

    var chart = new Chartist.Line('#' + params['id'], {
        labels: params['label'],
        series: series
    }, options);

    if (params['hasNamedSeries']) {
        chart.on('draw', function(context) {
            if (context.type == 'line' || context.type == 'point') {
                if (context.series['name'] == params['chartName']) {
                    context.element.attr({style: 'stroke: ' + params['color']});
                }
            } 
        });
    }
}

function aggregateFeatures(response) {
    // Aggregate the data from all tracks
    var aggFeatures = {};
    for (var i = 0; i < Object.keys(response).length; i++) {
        for (var feature in response[i]) {
            if (!(feature in aggFeatures)) {
                aggFeatures[feature] = [];
            }
            aggFeatures[feature].push(response[i][feature]);
        }
    }
    console.log(aggFeatures);
    return aggFeatures;
}

function buildAlbumModal(aggFeatures) { 
    // Graph
    buildKeyGraphs(aggFeatures);
    buildFeatureGraphs(aggFeatures);
}

// Handler Functions
// --------------------------------------------------------------------
function handleFeatureSuccess(id, response) {
    console.log(response);
    // Clear Modal
    $('#tfmText').empty();

    // Add heading and images
    $('#tfmText').append('<h3>' + $('#'+id+' .card-title').text() + '</h3>');
    $('#tfmImg img').attr('src', $('#'+id+' img').attr('src'));
    // Remove previous listeners
    $('#tfModal').off('shown.bs.modal');
    $('#modalPillTab').off('shown.bs.tab'); 
    var aggFeatures = aggregateFeatures(response);
    var respType = cachedResponse['respType'];
    // Add listener based on request type
    // We build+display graphs and data after modal fades in to
    // fix graphics bug
    if (respType == 'Album' || respType == 'Playlist') {
        // make pill tabs visible
        $('#modalPillTab').attr('class', 'nav nav-pills');
        // build graphs
        $('#tfModal').on('shown.bs.modal', function(e) {
            buildAlbumModal(aggFeatures);
        });
        $('#modalPillTab').on('shown.bs.tab', function(e){
            buildAlbumModal(aggFeatures);
        });
    } else if (respType == 'Track') {
        // make pill tabs invisible
        $('#modalPillTab').attr('class', 'nav nav-pills d-none');
        // show features
        $('#tfModal').on('shown.bs.modal', function(e) {
            clearFeatureGraphs();
            clearKeyGraphs();
            buildTrackFeatureModal(id, response);
        });
    } else {
        console.log('respType not correct');
    }
    $('#tfModal').modal();
}

function handleSearchSuccess(response) {
    // empty out cards on display
    $('#slide').empty();
    // TODO remove log during production
    console.log(response)
    
    // Get response type
    var request = $('form').serializeArray().reduce(function(obj,item){
        obj[item.name] = item.value;
        return obj;
    }, {});
    var respType = request['retRadios'];
    var id = 0;
    // Create cards for the returned data
    if (response == []) {
        $('slide').text = 'No results found';
    } else {
        $.each(response, function(index, data) {
            try {
               createCard(id, data, respType);
            } catch(e) {
                console.log(e);
            }
            id += 1;
        });
    }
    // Cache the response links so that we can use
    // them to dynamically load the modals.
    var links = [];
    for (var i = 0; i < response.length; i++) {
        links.push(response[i]['link']);
    }
    cachedResponse['result'] = links;
    cachedResponse['respType'] = respType;
}


function init() {
    $('#slide').on('click', '.card', function(e) {
        var id = e.currentTarget.id;
        var data = {
            'result': cachedResponse['result'][id],
            'respType': cachedResponse['respType']
        };
        // if id not in array bounds, log the error and don't do anything
        // otherwise, send a query to the backend
        if (id < 0 || id >= cachedResponse['result'].length) {
            console.log('Card id is less than 0');
        } else {
            $.ajax({
                url: '/feature',
                type: 'POST',
                data: data,
                success: function(response) {
                    handleFeatureSuccess(id, response);
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }
    });

    $('form').submit(function() {
        // TODO remove log during production
        console.log($('form').serialize());
        $.ajax({
            url: '/query',
            type: 'POST',                       
            data: $('form').serialize(),
            success: function(response) {
                handleSearchSuccess(response);                
            },
            error: function(error) {
                console.log(error);
            }
       });
       return false;
    });

    $('#inputArtist').focus();
}

$(window).on('load', init());


