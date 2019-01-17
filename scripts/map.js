require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Search",
    "esri/widgets/Fullscreen",
    "esri/widgets/BasemapToggle"
], function(Map, MapView, Search, Fullscreen, BasemapToggle) {
    var map = new Map({
        basemap: "dark-gray"
    });

    var view = new MapView({
        container: "mapView",
        center: [-98.58333333, 39.83333333],
        constraints: {
            snapToZoom: false,
            rotationEnabled: false,
        },
        map: map,
        zoom: 4
    });
    // Add default widgets to view
    var searchBar = new Search({
        view: view,
        resultGraphicEnabled: false,
        goToOverride: function(viewMap, goToParams) {
            return viewMap.goTo({ center: goToParams.center, zoom: 5 }, goToParams.options);
        }
    });
    view.ui.add(searchBar, "top-right");

    var fullscreen = new Fullscreen({
        view: view
    });
    view.ui.add(fullscreen, "bottom-right");

    var basemapToggle = new BasemapToggle({
        view: view,
        nextBasemap: "osm",
        titleVisible: true
    });
    view.ui.add(basemapToggle, "bottom-left");

});