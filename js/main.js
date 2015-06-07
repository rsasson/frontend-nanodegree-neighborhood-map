/*
* This contains the main code in progress brah,
* stay tuned for more.
*/

var map;
var markers = [];
var neighborhoods = [
  new google.maps.LatLng(37.77804178967591, -122.39662170410156),
  new google.maps.LatLng(37.77715986825405, -122.39413261413574),
  new google.maps.LatLng(37.7822477317096, -122.39121437072754),
  new google.maps.LatLng(37.766847390962376, -122.38838195800781),
  new google.maps.LatLng(37.77973776283843, -122.39009857177734)
];

function initialize() {
  var missionBay = new google.maps.LatLng(37.767997, -122.3921315)
  var mapOptions = {
    center: missionBay,
    zoom: 14
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
}

function drop() {
  clearMarkers();
  for (var i = 0; i < neighborhoods.length; i++) {
    addMarkerWithTimeout(neighborhoods[i], i * 200);
  }
}

// Add a marker to the map and push to the array.
function addMarkerWithTimeout(position, timeout) {
  window.setTimeout(function() {
    markers.push(new google.maps.Marker({
      position: position,
      map: map,
      animation: google.maps.Animation.DROP
    }));
  }, timeout);
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

google.maps.event.addDomListener(window, 'load', initialize);
