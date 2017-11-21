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
    
    //var population_domain = [10000,100000,200000,300000,400000,500000,600000,900000];
    var population_domain = [0,2,200,300,400,1000,1500,2000];

    // Define linear scale for output
    var population_color = d3.scaleThreshold()
        .domain(population_domain)
        .range(d3.schemeBlues[8]);              

    var healthIndex = d3.map();    

    /*
        Read in map .topojson
        + .csv
    */
    d3.queue()
      //.defer(d3.json, "canada.topojson")
      .defer(d3.json, "data/gcd_000b11a_e_geo_10_topo.json")
      .defer(d3.csv, "data/map_output.csv", function(d) {
            dict = {
                province_id: +d.province_id,
                division_name: d.division_name,
                province: d.province_name,
                num_tweets: +d.num_tweets,
                physical_activity: +d.physical_activity,
                sedentary_behavior: +d.sedentary_behavior,
                sleeping: +d.sleeping
            }
            healthIndex.set(+d.division_id, d); // ,+d.physical_activity,+d.sedentary_behavior, +d.sleeping);
            return dict
      })
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


        var districts = topojson.feature(data, data.objects.gcd_000b11a_e_geo).features

        console.log(districts)
        console.log(processedData);
        console.log(healthIndex);

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
           .attr("fill", function(d) { return population_color(d.tweets = healthIndex.get(d.properties.CDUID).num_tweets); })

           .on("mouseover", function(d){
                var mouse = d3.mouse(svg.node()).map(function(d) {
                    return parseInt(d);
                });

                d3.select("#info").append("text").attr("id","province")
                  .text("Province: " + d.properties.PRNAME)
                d3.select("#info").append("text").attr("id","city")
                  .text(" | City: " +     d.properties.CDNAME)
                d3.select("#info").append("text").attr("id","population")
                  .text(" | Population: " + d.properties.CDUID)

                d3.select(this).classed("selected", true);

                tooltip.classed('hidden', false)
                       .attr('style', 'left:' + (mouse[0] + 15) +
                             'px; top:' + (mouse[1] - 35) + 'px')
                       .html(d.properties.CDNAME);

                bars(healthIndex.get(d.properties.CDUID));
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
                          .attr("width", 100)
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
                  .data(population_domain.reverse())
                  .attr("x", 24)
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .text(function(d) { return d + ' tweets'; });


        /*
           Bar chart
        */
        function bars (data) {

            console.log('Bar')
            console.log(data)

            w = 960
            h = 500
            var barchart = d3.select("#bar-chart").append("svg")
                             .attr("height", h)
                             .attr("width", w),
            margin = {top: 20, right: 20, bottom: 30, left: 40},
            // width = +barchart.attr("width") - margin.left - margin.right,
            // height = +barchart.attr("height") - margin.top - margin.bottom
            width = w - margin.left - margin.right,
            height = h - margin.top - margin.bottom

            g = barchart.append("g").attr("transform",
                         "translate(" + margin.left + "," + margin.top + ")");

            var x0 = d3.scaleBand()
                       .rangeRound([0, width])
                       .paddingInner(0.1);

            var x1 = d3.scaleBand()
                       .padding(0.05);

            var y = d3.scaleLinear()
                      .rangeRound([height, 0]);

            var z = d3.scaleOrdinal()
                      .range(["#98abc5", "#6b486b", "#ff8c00"]);    

            var keys = data.columns.slice(4);
          
            x0.domain(data.map(function(d) { return d.division_name; }));
            x1.domain(keys).rangeRound([0, x0.bandwidth()]);
            y.domain([0, d3.max(data, function(d) {return d3.max(keys, function(key) { return d[key]; }); })]).nice();
          
            g.append("g")
              .selectAll("g")
              .data(data)
              .enter().append("g")
                .attr("transform", function(d) { return "translate(" + x0(d.division_name) + ",0)"; })
              .selectAll("rect")
              .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
              .enter().append("rect")
                .attr("x", function(d) { return x1(d.key); })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x1.bandwidth())
                .attr("height", function(d) { return height - y(d.value); })
                .attr("fill", function(d) { return z(d.key); });
          
            g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x0));
          
            g.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).ticks(null, "s"))
              .append("text")
                .attr("x", 2)
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text("# Tweets");
          
            var legend = g.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "end")
              .selectAll("g")
              .data(keys.slice().reverse())
              .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
          
            legend.append("rect")
                .attr("x", width - 19)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", z);
          
            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .text(function(d) { return d; });    
        }        

    }

})();