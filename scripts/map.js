require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Search",
    "esri/widgets/Fullscreen",
    "esri/widgets/BasemapToggle",
    "esri/layers/ImageryLayer",
    "esri/layers/MapImageLayer",
    "esri/widgets/LayerList",
    "esri/widgets/Popup",
    "esri/PopupTemplate",
    "esri/widgets/Legend"
], function(Map,
    MapView,
    Search,
    Fullscreen,
    BasemapToggle,
    ImageryLayer,
    MapImageLayer,
    LayerList,
    Popup,
    PopupTemplate,
    Legend) {
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
        // This does not work
        // goToOverride: function(viewMap, goToParams) {
        //     return viewMap.goTo({ center: goToParams.center, zoom: 5 }, goToParams.options);
        // }
    });
    view.ui.add(searchBar, "top-right");

    var fullscreen = new Fullscreen({
        view: view
    });
    view.ui.add(fullscreen, "top-right");

    var basemapToggle = new BasemapToggle({
        view: view,
        nextBasemap: "osm",
        titleVisible: true
    });
    view.ui.add(basemapToggle, "top-left");

    var layerList = new LayerList({
        view: view
    });
    view.ui.add(layerList, "bottom-left");

    var watchWarnPopup = new Popup({
        autoCloseEnabled: true,
        featureNavigationEnabled: true,
        spinnerEnabled: true,
        view: view
    });

    var watchWarnPopupTemplate = new PopupTemplate({
        title: "{prod_type}",
        content: "Issued: {issuance}<br>Expires: {expiration}<br><a href={url}>More Info</a>"
    });

    var legend = new Legend({
        layerInfos: {
            title: "Temperature",
            layer: currentTempLayer
        },
        style: {
            type: "card",
            layout: "stack",
        },
        view: view
    });
    view.ui.add(legend, "bottom-right");

    // Layers
    var radarImageryLayer = new ImageryLayer({
        popupEnabled: false,
        refreshInterval: 15,
        title: "Radar",
        url: "https://idpgis.ncep.noaa.gov/arcgis/rest/services/radar/radar_base_reflectivity_time/ImageServer"
    });
    map.add(radarImageryLayer);

    var currentTempLayer = new MapImageLayer({
        refreshInterval: 15,
        url: "https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NDFD_temp/MapServer",
        sublayers: [{
            id: 5,
            sublayers: [{
                id: 8,
                title: "Current Temperature"
            }],
            title: "Current Temperature"
        }],
        title: "Temperature"
    });
    map.add(currentTempLayer, 0);

    var watchesWarnings = new MapImageLayer({
        refreshInterval: 15,
        url: "https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer",
        sublayers: [{
            id: 1,
            popupEnabled: true,
            popupTemplate: watchWarnPopupTemplate,
            title: "Watches/Warnings"
        }],
        title: "Watches/Warnings"
    });
    map.add(watchesWarnings, 1);

    var snowDepthLayer = new MapImageLayer({
        refreshInterval: 15,
        url: "https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/NOHRSC_Snow_Analysis/MapServer",
        sublayers: [{
            id: 3,
            title: "Snow Depth"
        }],
        title: "Current Snow Depth"
    });
    map.add(snowDepthLayer);
});