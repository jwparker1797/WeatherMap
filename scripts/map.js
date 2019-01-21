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
    "esri/widgets/Legend",
    "dijit/layout/AccordionContainer",
    "dijit/layout/ContentPane",
    "dojo/domReady!"
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
    Legend,
    AccordionContainer,
    ContentPane) {
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

    var legend = new Legend({
        // layerInfos: [{
        //     title: "Current Temperature",
        //     layer: map.findLayerById("TempLayer")
        // }],
        style: {
            type: "classic",
            layout: "stack",
        },
        view: view
    });
    view.ui.add(legend);

    var layerList = new LayerList({
        // listItemCreatedFunction: function(event) {
        //     var item = event.item;
        //     if (item.layer.type != "group" && !item.layer.sublayers && item.layer.title === legend.layerInfos[0].title) {
        //         item.panel = {
        //             content: legend,
        //             open: false
        //         };
        //     }
        // },
        view: view
    });
    view.ui.add(layerList);

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
        id: "TempLayer",
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

    // Accordion Container Setup
    var accordionContainer = new AccordionContainer({ style: "height: 100%" }, "sideBar");

    accordionContainer.addChild(new ContentPane({
        title: "Layers",
        content: layerList
    }));

    accordionContainer.addChild(new ContentPane({
        title: "Legend",
        content: legend
    }));

    accordionContainer.addChild(new ContentPane({
        title: "Forecast",
        content: "Use the search bar to get a forecast for a location."
    }));
    accordionContainer.startup();

    // Forecasting
    searchBar.on("search-complete", function(event) {
        var searchExtentCenter = event.results[0].results[0].extent.center;
        getForecast(searchExtentCenter.longitude, searchExtentCenter.latitude, event.results[0].results[0].name);
    });

    var getForecast = function(x, y, place) {
        var Http = new XMLHttpRequest();
        var url = "https://api.weather.gov/points/" + y + "," + x + "/forecast";
        Http.open("GET", url);
        Http.send();
        console.log(Http.statusText)
        Http.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var forecastData = JSON.parse(Http.responseText);
                var forecastProperties = forecastData.properties;
                accordionContainer.getChildren().forEach(function(item) {
                    if (item.title === "Forecast") {
                        accordionContainer.selectChild(item, true);
                        item.domNode.innerHTML = "<h3>" + place + "</h3><br>";
                        forecastProperties.periods.forEach(function(fp) {
                            item.domNode.innerHTML += "<img src=" + fp.icon + "><br><b>" + fp.name + "</b>: <p style='font-size:12px'>" + fp.detailedForecast + "</p><br><br>";
                        })
                    }
                });
            }
        };
    };
});