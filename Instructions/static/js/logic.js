// Store API query variables
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Grab the data with d3
d3.json(url).then(function (data) {
    createFeatures(data.features);
});

// Your data markers should reflect the magnitude of the earthquake by their size and and depth of the earth quake by color. 
// Earthquakes with higher magnitudes should appear larger and earthquakes with greater depth should appear darker in color.
function markerSize(circle) {
    return circle * 5;
}

function chooseColor(mag) {
    if (mag > 5) {return "darker"}
    else if (mag > 4) {return "red"}
    else if (mag > 3) {return "orange"}
    else if (mag > 2) {return "yellow"}
    else if (mag > 1) {return "limegreen"}
    else {return "green"}
}

function createFeatures(earthquakeData) {
    function onEachFeatures(feature, layer) {
        layer.bindPopup("Magnitude:" + feature.properties.mag + "<br>Location:" + feature.properties.place + "<br>Date:" + new Date(feature.properties.time))
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        pointtoLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },

        style: function (feature) {
            console.log(feature.properties.mag)
            return {
                fillColor: chooseColor(feature.properties.mag),
                fillOpacity: 1,
                weight: 1.5,
                radius: markerSize(feature.properties.mag),
                stroke: false
            }
        },

        onEachFeatures: onEachFeatures
    });

    createImageBitmap(earthquakes);
}
 // Adding tile layer to the map
function createMap(earthquakes) {
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var baseMaps = {
        "Satellite": satellite,
        "Greyscale": lightMap,
        "Outdoors": outdoors
    };

    var overlayMaps = {
        Earthquakes: earthquakes 
    };

    // Creating map object
    var myMap = L.map("map", {
        center: [40.7, -73.95],
        zoom: 5,
        layers: [satellite, earthquakes]
    });

    // Create a control for our layers, add our overlay layers to it
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create a legend to display information about our map
    var legend = L.control({ position: "bottomright"});
    console.log(L);
    console.log(legend);
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var mag = [0, 1, 2, 3, 4, 5];

        for(var i = 0; i < mag.length; i++) {
            div.inneHTML +=
                '<i style="background:' + chooseColor(mag[i] + 1) + '"></i>' +
                mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>': '+');
        }

        return div;
    };
    legend.addTo(myMap);
}
