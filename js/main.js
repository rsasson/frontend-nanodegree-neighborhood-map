
var map; // variable for google maps object
var businesses = []; // array of business objects
var error = false; // flag to show error message

var YELP_BASE_URL = 'http://api.yelp.com/v2';
var YELP_KEY = 'ilfd6qQVAfyUuN8I6qHDlA';
var YELP_KEY_SECRET = 'REg1w_nqJOu9C4Jqk_j_oMaoVZA';
var YELP_TOKEN = 'v5ach-hxP2z9J8n2WDEt0uPrN8V46vio';
var YELP_TOKEN_SECRET = 'vQBGDBWcoS5U05CJ0qzJoLP_2x8';

var MISSION_BAY_LAT = 37.767997;
var MISSION_BAY_LON = -122.3921315;

var INFO_WINDOW_TITLE = "<h2 style=\"margin: 0 auto\">%TITLE%</h2>";
var INFO_WINDOW_IMAGE = "<img src=\"%IMAGE%\" alt=\"Image not found\" height=\"100%\" width=\"100%\">";
var INFO_WINDOW_DIV = "<div class=\"container\">" + INFO_WINDOW_TITLE + INFO_WINDOW_IMAGE + "</div>";

function initialize() {
  var missionBay = new google.maps.LatLng(MISSION_BAY_LAT, MISSION_BAY_LON);
  var mapOptions = {
    center: missionBay,
    zoom: 14
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

/*
function drop() {
  clearMarkers();
  for (var i = 0; i < neighborhoods.length; i++) {
    addMarkerWithTimeout(neighborhoods[i], i * 200, 725);
  }
}


// Add a marker to the map and push to the array.
function addMarkerWithTimeout(position, dropTimeout, bounceTimeout) {
  var marker = new google.maps.Marker({
    position: position,
    map: map,
    animation: google.maps.Animation.DROP
  });
  google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
      // Set marker to bounce for duration of bounceTimeout
      marker.setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(function() {
        marker.setAnimation(null);
      }, bounceTimeout);
  });
  window.setTimeout(function() {
    markers.push(marker);
  }, dropTimeout);
}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
*/

/*
* Given an array of yelp search results, transform all results
* to a more easily easily consumable format.
*
* There is a knockout observable array that will consume this data
* (and make changes to the map ).
*/
function transformBusinesses(businesses) {
  var output = [];
  for (var i = 0; i < businesses.length; i++) {
    var title = businesses[i].name;
    var loc = businesses[i].location.coordinate;
    var googleLocation = new google.maps.LatLng(loc.latitude, loc.longitude);
    var infoWindow = new google.maps.InfoWindow({
      content: INFO_WINDOW_DIV.
                replace('%IMAGE%', businesses[i].image_url).
                replace('%TITLE%', businesses[i].name)
    });
    var transformed = {
      title: title,
      location: googleLocation,
      infoWindow: infoWindow
    };
    output.push(transformed)
  }
  return output;
}

/*
* Query yelp based on query term, lat, and lon.
*
* On success change the contents of observable array.
*
* On failure show warning banner.
*
* Based on MarkN's code to access yelp api.
*/
function yelpQuery(query, lat, lon) {
  // Remove warning banner
  error = false;

  var yelp_url = YELP_BASE_URL + '/search';

  var parameters = {
    term: query,
    ll: lat + ',' + lon,
    oauth_consumer_key: YELP_KEY,
    oauth_token: YELP_TOKEN,
    oauth_nonce: Math.floor(Math.random() * 1e12).toString(),
    oauth_timestamp: Math.floor(Date.now()/1000),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version : '1.0',
    callback: 'cb'
  };

  var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
  parameters.oauth_signature = encodedSignature;

  var settings = {
    url: yelp_url,
    data: parameters,
    cache: true,
    dataType: 'jsonp',
    success: function(results) {
      // Change list of business data structures
      var transformedBusinesses = transformBusinesses(results.businesses);
      businesses = transformedBusinesses;
    },
    fail: function() {
      // Set warning banner to visible
      error = true;
    }
  };

  $.ajax(settings);
}

google.maps.event.addDomListener(window, 'load', initialize);
