(function() {

    var margin = {top: 20, left: 20, right: 20, bottom: 20},
        height = 720 - margin.top - margin.bottom;
        width = 1280 - margin.left - margin.right;

    var svg = d3.select("#map")
            .append("svg")
            .attr("height", height + margin.top + margin.bottom)
            .attr("width", width + margin.left + margin.right)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var population_domain = [10000,100000,200000,300000,400000,500000,600000,900000];
    var population_color = d3.scaleThreshold()
        .domain(population_domain)
        .range(d3.schemeBlues[8]);              
    /*
        Read in map .topojson
        + .csv
    */
    d3.queue()
      .defer(d3.json, "canada.topojson")
      .defer(d3.csv, "map_output.csv")
      .await(ready)

    /*
        Create projection
        + center (translate)
        + zoom (scale)
    */
    /*
    var projection = d3.geoMercator()
        .translate([width / 1.5, height])
        .scale(200)

    var path = d3.geoPath()
        .projection(projection)
    */
    var projection = d3.geoAlbers()
    .translate([width/2.2, height/.93])

    var path = d3.geoPath()
    .projection(projection)    


    function ready(error, data, processedData) {
        if (error) {
            console.log(error)
        }

        var districts = topojson.feature(data, data.objects.districts2011).features

        console.log(districts)

        /*
        Add path for each district
        */
        svg.selectAll(".district")
            .data(districts)
            .enter().append("path")
            .attr("class", "district")
            .attr("d", path)
            .attr("fill", function(d) { return population_color(d.properties.pop10yrcensus); })

            .on("mouseover", function(d){
                d3.select("#info").append("text").attr("id","province")
                .text("Province: " + d.properties.prov)
                d3.select("#info").append("text").attr("id","city")
                .text(" | City: " +     d.properties.name_en)
                d3.select("#info").append("text").attr("id","population")
                .text(" | Population: " + d.properties.pop10yrcensus)
                d3.select(this).classed("selected", true);
            })

            .on("mouseout", function(d){
                d3.select("#province").remove();
                d3.select("#city").remove();
                d3.select("#population").remove();
                d3.select(this).classed("selected", false);
            })
    }

})();