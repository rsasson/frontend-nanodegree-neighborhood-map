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

var contentString = '<div id="content">'+
    '<div id="siteNotice">'+
    '</div>'+
    '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
    '<div id="bodyContent">'+
    '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
    'sandstone rock formation in the southern part of the '+
    'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
    'south west of the nearest large town, Alice Springs; 450&#160;km '+
    '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
    'features of the Uluru - Kata Tjuta National Park. Uluru is '+
    'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
    'Aboriginal people of the area. It has many springs, waterholes, '+
    'rock caves and ancient paintings. Uluru is listed as a World '+
    'Heritage Site.</p>'+
    '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
    'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
    '(last visited June 22, 2009).</p>'+
    '</div>'+
    '</div>';

var infowindow = new google.maps.InfoWindow({
    content: contentString
});

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

google.maps.event.addDomListener(window, 'load', initialize);
