var map = L.map('mapid').setView([41.8987799,-87.7065705], 10);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a>contributors',
  maxZoom: 17  
}).addTo(map);

var typeCrimeBarChart = dc.barChart("#typeCrime-Chart");
var crimeHourLine = dc.seriesChart("#crimeHour-line");

var colorScale = d3.scale.ordinal()
  .domain(["HOMICIDE", "ROBBERY", "BURGLARY"])
  .range(["#ca0020", "#0571b0", "#fdae61"]);

var dtgFormat = d3.time.format.utc("%m/%d/%Y %I:%M:%S %p");

d3.csv("Crimes_Chicago_Sep2017.csv", function (data) {
  data.forEach(function(d){
   d.dtg = dtgFormat.parse(d.Date);
   d.lat = d.Latitude;
   d.lon = d.Longitude;
   d.crimeType = d['Primary Type'];

  console.log(d.dtg);
  var circle = L.circle([d.lat, d.lon], 100, {
    color: colorScale(d.crimeType),
    weight: 2,
    fillColor: colorScale(d.crimeType),
    fillOpacity: 0.5
  })
  .bindPopup("Type of Crime: "+d.crimeType+"<br>"+" Time: "+d.dtg)
  .addTo(map);


  });


  var facts = crossfilter(data);


  var typeCrimeDim = facts.dimension(function(d){
    return d.crimeType;
  });

  var typeCrimeCount = typeCrimeDim.group();

  var hourDim = facts.dimension(function(d){

    return d3.time.hour(d.dtg);
  });


  var seriesDimension = facts.dimension(function(d){
                return [d3.time.day(d.dtg),d["Primary Type"]];
              })

  var seriesDimensionCount = seriesDimension.group();
  typeCrimeBarChart.width(480)
                .height(150)
                .margins({top:10, right:10, bottom:20, left:40})
                .dimension(typeCrimeDim)
                .x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .renderHorizontalGridLines(true)
                .brushOn(false)
                .on('renderlet', function(chart){
                                    chart.selectAll('rect.bar').each(function(d){
                                        d3.select(this).attr("style", "fill: " + colorScale(d.x));
                                    });
                                }
                    )
                .ordering(function(d){return d.value})
                .group(typeCrimeCount);

  var timeDim = facts.dimension(d => d.dtg)

  crimeHourLine.width(1200)
                .height(250)
                .margins({top:10, right:10, bottom:20, left:40})
                .dimension(seriesDimension)
                .group(seriesDimensionCount)
                .transitionDuration(500)
                .elasticY(true)
                // .x(d3.time.scale().domain(d3.extent(data, function(d) { d3.time.day(d.dtg); })))
                .x(d3.time.scale().domain([d3.time.day(timeDim.bottom(1)[0].dtg),d3.time.day(timeDim.top(1)[0].dtg)]))
                .seriesAccessor(function(d) { return d.key[1]; })
                .keyAccessor(function(d) {return d.key[0];})
                .valueAccessor(d => d.value)
                .ordinalColors(["#ca0020", "#0571b0", "#fdae61"]);

  dc.renderAll();


});


/* 

d3.csv("Crimes_Chicago_Śep2017.csv", functin(data){
var dtgFormat = d3.time.format.utc("%Y-%m-%dT%H:%M:%S");
})  */
//row chart