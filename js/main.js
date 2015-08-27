
var map; // google maps object
var currentInfoWindow = null;
var markers = [];

// Knockout view model object
var ViewModel = function() {
  this.businesses = ko.observableArray([]); // observable array of business objects
  this.query = ko.observable(""); // string in search box
  this.error = ko.observable(false); // flag to show error message
  this.visibleList = ko.computed(function() { // list of visible businesses
    var query = this.query().toLowerCase();
    if (!query) {
        return this.businesses();
    } else {
        return ko.utils.arrayFilter(this.businesses(), function(business) {
            return business.title.toLowerCase().includes(query);
        });
    }
  }, this);
  this.updateMarkers = ko.computed(function() { // operation to update map
    var vizBizs = this.visibleList();
    hideAllMarkers();
    ko.utils.arrayForEach(vizBizs, function(vizBiz) {
      markers[vizBiz.index].setMap(map);
    });
  }, this);
};

var viewModel = new ViewModel();
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
  yelpQuery('food', MISSION_BAY_LAT, MISSION_BAY_LON, viewModel);
}

function hideAllMarkers() {
  markers.forEach(function(marker) {
    marker.setMap(null);
    marker.infoWindow.close();
  });
}

/*
* Object that encapsulates state relevant to rendering a business
* on the list and map
*/
var TransformedBusiness = function(index, business) {
  this.index = index;
  this.title = business.name;
  this.clickFunction = function() {
    google.maps.event.trigger(markers[this.index], 'click');
  };
}

/*
* Helper to instantiate gmaps marker object
*/
function createMarker(business) {
  var loc = new google.maps.LatLng(business.location.coordinate.latitude,
    business.location.coordinate.longitude);
  var marker = new google.maps.Marker({
    position: loc,
    map: map,
    animation: google.maps.Animation.DROP
  });
  marker.infoWindow = new google.maps.InfoWindow({
              content: INFO_WINDOW_DIV.
              replace('%IMAGE%', business.image_url).
              replace('%TITLE%', business.name)
  });
  google.maps.event.addListener(marker, 'click', function() {
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }
      currentInfoWindow = this.infoWindow;
      currentInfoWindow.open(map, this);
      this.setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(function(marker) {
        marker.setAnimation(null);
      }, 725, this);
  });
  return marker;
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
function yelpQuery(query, lat, lon, viewModel) {
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
      for (i = 0; i < results.businesses.length; i++) {
        // Create marker object, push to global array
        var marker = createMarker(results.businesses[i]);
        markers.push(marker);
        // Create processed business object and place into view model
        var biz = new TransformedBusiness(i, results.businesses[i]);
        viewModel.businesses.push(biz);
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
