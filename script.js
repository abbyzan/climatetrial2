/* global L, carto */
/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

var map = L.map('map', {
  doubleClickZoom: false 
}).setView([38.9, -77], 11.5);

// Add base layer
L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: 'default_public',
  username: 'schwa464'
});

// Initialze source data
var syncdatasource = new carto.source.SQL('SELECT * FROM climateofchange_data2');

// Create style for the data
var syncdatastyle = new carto.style.CartoCSS(`
 #layer {
  marker-width: 7;
  marker-fill: ramp([type], (#7F3C8D, #11A579, #3969AC, #F2B701, #E73F74, #A5AA99), ("Food ", "Health", "health", "Food", "Shelter"), "=");
  marker-fill-opacity: 1;
  marker-allow-overlap: true;
  marker-line-width: 0;
  marker-line-color: #FFFFFF;
  marker-line-opacity: 1;
}
`);

// Add style to the data
var syncdatalayer = new carto.layer.Layer(syncdatasource, syncdatastyle);




// Initialze source data
var formSource = new carto.source.Dataset('climate_of_change_resource_googleform');

// Create style for the data
var formStyle = new carto.style.CartoCSS(`
#layer {
  marker-width: 7;
  marker-fill: red;
  marker-fill-opacity: 1;
  marker-allow-overlap: true;
  marker-line-width: 0;
  marker-line-color: #FFFFFF;
  marker-line-opacity: 1;
}
`);

// Add style to the data
var formLayer = new carto.layer.Layer(formSource, formStyle);




// Add the data to the map as two layers. Order matters here--first one goes on the bottom
client.addLayers([formLayer, syncdatalayer]);
client.getLeafletLayer().addTo(map);



/*
 * Listen for changes on the layer picker
 */

// Step 1: Find the dropdown by class. If you are using a different class, change this.
var layerPicker = document.querySelector('.layer-picker');

// Step 2: Add an event listener to the dropdown. We will run some code whenever the dropdown changes.
layerPicker.addEventListener('change', function (e) {
  // The value of the dropdown is in e.target.value when it changes
  var type = e.target.value;
  
  // Step 3: Decide on the SQL query to use and set it on the datasource
  if (type === 'all') {
    // If the value is "all" then we show all of the features, unfiltered
    // EB: changed "source" to "dumpingsource"
    syncdatasource.setQuery("SELECT * FROM climateofchange_data2");
  }
  else {
    // Else the value must be set to a life stage. Use it in an SQL query that will filter to that life stage.
    // EB: changed "source" to "dumpingsource" again
    syncdatasource.setQuery("SELECT * FROM climateofchange_data2 WHERE type  = '" +type+ "'");
  }
  
  // Sometimes it helps to log messages, here we log the lifestage. You can see this if you open developer tools and look at the console.
  console.log('Dropdown changed to "' + type + '"');
});

// Note: any column you want to show up in the popup needs to be in the list of
// featureClickColumns below
var layer = new carto.layer.Layer(syncdatasource, syncdatastyle, {
  featureClickColumns: ['resource_name', 'type', 'website_link']
});

layer.on('featureClicked', function (event) {
  // Create the HTML that will go in the popup. event.data has all the data for 
  // the clicked feature.
  //
  // I will add the content line-by-line here to make it a little easier to read.
  var content = '<div class = popuptitle>' + event.data['resource_name'] + '</div>';
  content += '<div>Type:' + event.data['type'] + '</div>';
   content += '<div>Link:' + event.data['website_link'] + '</div>';
  
  // If you're not sure what data is available, log it out:
  console.log(event.data);
  
  var popup = L.popup();
  popup.setContent(content);
  
  // Place the popup and open it
  popup.setLatLng(event.latLng);
  popup.openOn(map);
});

// Add the data to the map as a layer
client.addLayer(layer);
client.getLeafletLayer().addTo(map);
