# Welcome to my Weather Map

First things first, check your current weather forecast from  [my map](https://jwparker1797.github.io/WeatherMap/map.html).  

As you will find, there are a few layers that show some interesting weather data including: radar, current temperatures, weather watches and warnings, and a current snow depth layer.  I have also added a forecast ability by searching for a location using the search bar.

Below I will outline some of the code I used to accomplish this web map.

## Layers

Before making the app, I went to the NWS (National Weather Service) GIS service enpoints and found the layers (and URL's) I wanted to use.  An example of how I added one of the layers is shown below.

```javascript
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

map.add(watchesWarnings);
```

## Widgets

Widgets are a crucial element of web maps.  For this weather map I included a bunch of great widgets.  

The widgets placed on the map include a handful of default ArcGIS API widgets like zoom, a basemap toggle, a fullscreen button, and a search bar that I use to get a location to send to the NWS API to pull a forecast.

There are a few widgets placed in the accordian menu on the left side of the app that include a layer list (with visibility switches), a legend, and my custom forecast widget.

Below you will see the code for the search bar widget and how it interacts with my forecast widget.

```javascript
    var searchBar = new Search({
        view: view,
        resultGraphicEnabled: false,
        popupEnabled: false
    });
    view.ui.add(searchBar, "top-right");

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
```

If you have had a chance to try out the map, you may have noticed there are popups.  Popups are actually a widget as well, and can include custom information by using a popup template.  Below you will see how I create popups for the watches/warnings layer.

```javascript
    var watchWarnPopupTemplate = new PopupTemplate({
        title: "{prod_type}",
        content: "Issued: {issuance}<br>Expires: {expiration}<br><a href={url}>More Info</a>"
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
```

## Side Menu

In the previous example, you may have noticed I was referecning an accordian container.  This is menu that acts like a slinky and it comes directly from dojo (dijit to be exact).  Inside the accordian container there are content panes which are just div's, so these can contain anything a normal div would, like widgets!  Below you can see how I created the container menu and content panes.

```javascript
    var accordionContainer = new AccordionContainer({
        style: "height: 100%",
    }, "sideBar");

    accordionContainer.addChild(new ContentPane({
        title: "Layers",
        content: layerList
    }));
```

### Check out more of my work

Hope you enjoyed this guide to my weather map.
Go to my [page](https://jwparker1797.github.io/) to check out more of my work.
