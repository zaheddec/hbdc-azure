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
    // Define linear scale for output
    var population_color = d3.scaleThreshold()
        .domain(population_domain)
        .range(d3.schemeBlues[8]);              

    var legendText = [];
    var start = 1.0
    for (var i = 0; i < 8; i++) {
        legendText.push(start);
        start -= 0.125;
    }

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
        var tooltip = d3.select('#map').append('div')
                        .attr('class', 'hidden tooltip');

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
                var mouse = d3.mouse(svg.node()).map(function(d) {
                    return parseInt(d);
                });

                d3.select("#info").append("text").attr("id","province")
                  .text("Province: " + d.properties.prov)
                d3.select("#info").append("text").attr("id","city")
                  .text(" | City: " +     d.properties.name_en)
                d3.select("#info").append("text").attr("id","population")
                  .text(" | Population: " + d.properties.pop10yrcensus)

                d3.select(this).classed("selected", true);

                tooltip.classed('hidden', false)
                       .attr('style', 'left:' + (mouse[0] + 15) +
                             'px; top:' + (mouse[1] - 35) + 'px')
                       .html(d.properties.name_en);
        
           })

           .on("mouseout", function(d){
                d3.select("#province").remove();
                d3.select("#city").remove();
                d3.select("#population").remove();
                d3.select(this).classed("selected", false);
                tooltip.classed('hidden', true);
           })

           // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
           var legend = d3.select("body").append("svg")
                          .attr("class", "legend")
                          .attr("width", 400)
                          .attr("height", 400)
                          .selectAll("g")
                          .data(population_color.domain().slice().reverse())
                          .enter()
                          .append("g")
                          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                  .attr("width", 18)
                  .attr("height", 18)
                  .style("fill", population_color);

            legend.append("text")
                  .data(legendText)
                  .attr("x", 24)
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .text(function(d) { return d; });
    }

})();