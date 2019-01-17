require([
    "esri/Map",
    "esri/views/MapView"
], function(Map, MarView) {
    var map = new Map({
        basemap: "streets"
    });

    var view = new MarView({
        container: "mapView",
        map: map
    });
});