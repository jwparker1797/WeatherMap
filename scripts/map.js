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
        popupEnabled: false
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

    view.when(function() {
        var legend = new Legend({
            style: {
                type: "classic",
                layout: "stack",
            },
            layerInfos: [{
                layer: currentTempLayer
            }, {
                layer: watchesWarnings
            }, {
                layer: snowDepthLayer
            }],
            view: view
        });
        view.ui.add(legend);
        accordionContainer.addChild(new ContentPane({
            title: "Legend",
            content: legend
        }), 1);
    });

    var layerList = new LayerList({
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

    // https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=tasks-identify
    var temperaturePopupTemplate = new PopupTemplate({
        title: "Temperature",
        content: "{Raster.ServicePixelValue}"
    });

    // Layers
    var radarImageryLayer = new ImageryLayer({
        // popupEnabled: false,
        refreshInterval: 15,
        title: "Radar",
        popupEnabled: true,
        popupTemplate: temperaturePopupTemplate,
        url: "https://idpgis.ncep.noaa.gov/arcgis/rest/services/radar/radar_base_reflectivity_time/ImageServer"
    });

    var currentTempLayer = new MapImageLayer({
        refreshInterval: 15,
        id: "TempLayer",
        url: "https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NDFD_temp/MapServer",
        sublayers: [{
            id: 5,
            sublayers: [{
                id: 8,
                title: "Current Temperature",
            }],
            title: "Current Temperature"
        }],
        title: "Temperature",
        visible: false
    });

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

    var snowDepthLayer = new MapImageLayer({
        refreshInterval: 15,
        url: "https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/NOHRSC_Snow_Analysis/MapServer",
        sublayers: [{
            id: 3,
            title: "Snow Depth"
        }],
        title: "Current Snow Depth",
        visible: false
    });

    map.add(snowDepthLayer);
    map.add(currentTempLayer);
    map.add(watchesWarnings);
    map.add(radarImageryLayer);

    // Accordion Container Setup
    var accordionContainer = new AccordionContainer({
        style: "height: 100%",
    }, "sideBar");

    accordionContainer.addChild(new ContentPane({
        title: "Layers",
        content: layerList
    }));

    accordionContainer.addChild(new ContentPane({
        title: "Forecast",
        id: "ForecastPane",
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
        Http.onreadystatechange = function() {
            var forecastPane = document.getElementById("ForecastPane");

            if (this.readyState == 4 && this.status == 200) {
                var forecastData = JSON.parse(Http.responseText);
                var forecastProperties = forecastData.properties;
                accordionContainer.selectChild("ForecastPane", true);
                forecastPane.innerHTML = "<h3>" + place + "</h3><br>";
                forecastProperties.periods.forEach(function(fp) {
                    forecastPane.innerHTML += "<img src=" + fp.icon + "><br><b>" + fp.name + "</b>: <p style='font-size:12px'>" + fp.detailedForecast + "</p><br><br>";
                });
            } else if (this.readyState == 4 && this.status == 404) {
                forecastPane.innerHTML = "Location not found.  Forecasts are only available for locations in the United States.";
            }
        };
    };
});