// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

/**
  * A class to help using the HTML5 Geolocation API.
  */
class LocationHelper {
    // Location values for latitude and longitude are private properties to protect them from changes.
    #latitude = '';

    /**
     * Getter method allows read access to privat location property.
     */
    get latitude() {
        return this.#latitude;
    }

    #longitude = '';

    get longitude() {
        return this.#longitude;
    }

   /**
    * Create LocationHelper instance if coordinates are known.
    * @param {string} latitude 
    * @param {string} longitude 
    */
   constructor(latitude, longitude) {
       this.#latitude = (parseFloat(latitude)).toFixed(5);
       this.#longitude = (parseFloat(longitude)).toFixed(5);
   }

    /**
     * The 'findLocation' method requests the current location details through the geolocation API.
     * It is a static method that should be used to obtain an instance of LocationHelper.
     * Throws an exception if the geolocation API is not available.
     * @param {*} callback a function that will be called with a LocationHelper instance as parameter, that has the current location details
     */
    static findLocation(callback) {
        const geoLocationApi = navigator.geolocation;

        if (!geoLocationApi) {
            throw new Error("The GeoLocation API is unavailable.");
        }

        // Call to the HTML5 geolocation API.
        // Takes a first callback function as argument that is called in case of success.
        // Second callback is optional for handling errors.
        // These callbacks are given as arrow function expressions.
        geoLocationApi.getCurrentPosition((location) => {
            // Create and initialize LocationHelper object.
            let helper = new LocationHelper(location.coords.latitude, location.coords.longitude);
            // Pass the locationHelper object to the callback.
            callback(helper);
        }, (error) => {
           alert(error.message)
        });
    }
}

/**
 * A class to help using the Leaflet map service.
 */
class MapManager {

    #map
    #markers

    /**
    * Initialize a Leaflet map
    * @param {number} latitude The map center latitude
    * @param {number} longitude The map center longitude
    * @param {number} zoom The map zoom, defaults to 18
    */
    initMap(latitude, longitude, zoom = 18) {
        // set up dynamic Leaflet map
        this.#map = L.map('map').setView([latitude, longitude], zoom);
        var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + ' Contributors'}).addTo(this.#map);
        this.#markers = L.layerGroup().addTo(this.#map);
    }

    /**
    * Update the Markers of a Leaflet map
    * @param {number} latitude The map center latitude
    * @param {number} longitude The map center longitude
    * @param {{latitude, longitude, name}[]} tags The map tags, defaults to just the current location
    */
    updateMarkers(latitude, longitude, tags = []) {
        // delete all markers
        this.#markers.clearLayers();
        L.marker([latitude, longitude])
            .bindPopup("Your Location")
            .addTo(this.#markers);
        for (const tag of tags) {
            L.marker([tag.location.latitude,tag.location.longitude])
                .bindPopup(tag.name)
                .addTo(this.#markers);  
        }
    }
}

/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
function updateLocation() {
    // Aufruf der findLocation-Funktion, um die aktuelle Position zu erhalten
    LocationHelper.findLocation((location) => {
        // Aktualisierung der Latitude und Longitude in den Eingabefeldern des Tagging-Formulars
        document.getElementById('latitude').value = location.latitude;
        document.getElementById('longitude').value = location.longitude;

        // Aktualisierung der Latitude und Longitude in den versteckten Eingabefeldern des Discovery-Formulars
        document.getElementById('search_latitude').value = location.latitude;
        document.getElementById('search_longitude').value = location.longitude;

        // Erzeugen einer neuen Instanz der MapManager-Klasse
        const mapManager = new MapManager();

        // Initialisierung der Karte mit der aktuellen Position
        mapManager.initMap(location.latitude, location.longitude);

        // Löschen des <img>-Elements und des <p>-Elements für die Beschriftung
        const mapView = document.getElementById('mapView');
        mapView.parentNode.removeChild(mapView);
        const spanElement = mapView.nextElementSibling;
        spanElement.parentNode.removeChild(spanElement);

        // Aufruf von updateMarkers, um die Position auf der Karte anzuzeigen
        mapManager.updateMarkers(location.latitude, location.longitude);
    });
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", updateLocation);