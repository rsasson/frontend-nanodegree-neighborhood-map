
var map; // google maps object
var markers = []; // markers on map
var element = null;

// TODO Add 5 hardcoded values
var viewModel = {
  businesses: ko.observableArray([]), // observable array of business objects
  error: ko.observable(false), // flag to show error message
  updateMap: function() {
    yelpQuery($('#search-bar').val(), MISSION_BAY_LAT, MISSION_BAY_LON);
  }
};
ko.applyBindings(viewModel);

var YELP_BASE_URL = 'http://api.yelp.com/v2';
var YELP_KEY = 'ilfd6qQVAfyUuN8I6qHDlA';
var YELP_KEY_SECRET = 'REg1w_nqJOu9C4Jqk_j_oMaoVZA';
var YELP_TOKEN = 'v5ach-hxP2z9J8n2WDEt0uPrN8V46vio';
var YELP_TOKEN_SECRET = 'vQBGDBWcoS5U05CJ0qzJoLP_2x8';

var MISSION_BAY_LAT = 37.767997;
var MISSION_BAY_LON = -122.3921315;

var INFO_WINDOW_TITLE = "<h2 style=\"margin: 0 auto\">%TITLE%</h2>";
var INFO_WINDOW_IMAGE = "<img src=\"%IMAGE%\" alt=\"Image not found\">";
var INFO_WINDOW_DIV = "<div class=\"container\">" + INFO_WINDOW_TITLE + INFO_WINDOW_IMAGE + "</div>";

function initialize() {
  var missionBay = new google.maps.LatLng(MISSION_BAY_LAT, MISSION_BAY_LON);
  var mapOptions = {
    center: missionBay,
    zoom: 14
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

// Add a marker to the map and push to the array.
function addMarkerWithTimeout(business, dropTimeout, bounceTimeout) {
  var marker = new google.maps.Marker({
    position: business.position,
    map: map,
    animation: google.maps.Animation.DROP
  });
  google.maps.event.addListener(marker, 'click', function() {
      business.infoWindow.open(map,marker);
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

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

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
      position: googleLocation,
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
  viewModel.error(false);

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

      // Clear old state from observable array and map
      viewModel.businesses.removeAll();
      deleteMarkers();

      // update view model array and map with new markers
      for (i = 0; i < transformedBusinesses.length; i++) {
        viewModel.businesses.push(transformedBusinesses[i]);
        addMarkerWithTimeout(transformedBusinesses[i], i * 200, 725);
      }
    },
    error: function() {
      // Set warning banner to visible
      viewModel.error(true);
    }
  };

  $.ajax(settings);
}

google.maps.event.addDomListener(window, 'load', initialize);
