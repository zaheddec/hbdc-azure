(function() {
    var margin = {top: 20, left: 20, right: 20, bottom: 20},
        height = 720 - margin.top - margin.bottom;
        width = 1280 - margin.left - margin.right;

    var map = d3.select("#map")
            .append("svg")
            .attr("height", height + margin.top + margin.bottom)
            .attr("width", width + margin.left + margin.right)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    w = 960
    h = 500

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    bar_width = w - margin.left - margin.right,
    bar_height = h - margin.top - margin.bottom

    var barchart = d3.select("#bar-chart").select("svg")
                        .attr("height", h)
                        .attr("width", w)

    var x0 = d3.scaleBand()
                .rangeRound([0, bar_width])
                .paddingInner(0.1);

    var x1 = d3.scaleBand()
                .padding(0.05);

    var y = d3.scaleLinear()
                .rangeRound([bar_height, 0]);

    var z = d3.scaleOrdinal()
                .range(["#98abc5", "#6b486b", "#ff8c00"]);    

    //var population_domain = [10000,100000,200000,300000,400000,500000,600000,900000];
    var population_domain = [0,2,200,300,400,1000,1500,2000];

    var healthIndex = d3.map(); 
    
    // Define linear scale for output
    var pa_color = d3.scaleThreshold()
        .domain(population_domain)
        .range(d3.schemeBlues[8]);              

    var sedentary_color = d3.scaleThreshold()
        .domain(population_domain)
        .range(d3.schemeGreens[8]);

    var sleep_color = d3.scaleThreshold()
        .domain(population_domain)
        .range(d3.schemeReds[8]);


    var tooltip = d3.select('#map').append('div')
                    .attr('class', 'hidden tooltip');

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
                division_id: +d.division_id,
                division_name: d.division_name,
                province: d.province_name,
                num_tweets: +d.num_tweets,
                physical_activity: +d.physical_activity,
                sedentary_behavior: +d.sedentary_behavior,
                sleeping: +d.sleeping   
            }
            healthIndex.set(+d.division_id, dict); // ,+d.physical_activity,+d.sedentary_behavior, +d.sleeping);
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

        // console.log(districts)
        // console.log(processedData);
        // console.log(healthIndex);


        updateMap();
        
        /*
            select color based on indicator
        */
        d3.selectAll("input[name='topic']").on("change", function(){
            console.log("calling map update!! # ", this.value)
            //removing values but no effect
            d3.select("#ltext").remove();
            d3.select("#lrect").remove();
            updateMap();
        });

        // for legend color
        var legend_color;


        function updateMap () {
            console.log("here it enters")
            map.selectAll(".district")
            .data(districts)
            .enter().append("path")
            //.attr("class", "district")
            .attr("d", path)
            .attr("fill", function(d) { 
                indicator = d3.select('input[name="topic"]:checked').node().value;
                if (indicator == 'sedentary'){
                    //console.log("Adding new colore : ",indicator);
                    legend_color = sedentary_color;
                    return sedentary_color(d.tweets = healthIndex.get(d.properties.CDUID).num_tweets);
                }else if (indicator == 'sleep'){
                    //console.log("Adding new colore : ",indicator);
                    legend_color = sleep_color;
                    return sleep_color(d.tweets = healthIndex.get(d.properties.CDUID).num_tweets);
                }else{
                    //console.log("Adding new colore : ",indicator);
                    legend_color=pa_color;
                    return pa_color(d.tweets = healthIndex.get(d.properties.CDUID).physical_activity);
                }
            })
            
            .on("mouseover", function(d){
                    var mouse = d3.mouse(map.node()).map(function(d) {
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

            })

            .on("mouseout", function(d){
                    d3.select("#province").remove();
                    d3.select("#city").remove();
                    d3.select("#population").remove();
                    d3.select(this).classed("selected", false);
                    tooltip.classed('hidden', true);
            })

            // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
            var legend = map.append("svg")
                            //.attr("class", "legend")
                            .attr("width", 120)
                            .attr("height", 400)
                            .selectAll("g")
                            .data(legend_color.domain().slice().reverse())
                            .enter()
                            .append("g")
                            //.attr("transform", "translate(0,40)");
                            .attr("transform", function(d, i) { return "translate(5," + i * 20 + ")"; });

                legend.append("rect")
                    .attr("id","lrect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", legend_color);

                legend.append("text")
                    .attr("id","ltext")
                    .data(population_domain.reverse())
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", ".45em")
                    .text(function(d) { return d + ' tweets'; })
                    .style("fill", "white");
        }

        // //color map
        // function mapColor(){
        //     console.log("enter fill")
        //     map.selectAll("path")
        //     .data(districts)
        //     .enter().append("path")
        //     .attr("d", path)
        //     .attr("fill", function(d) { 
        //         indicator = d3.select('input[name="topic"]:checked').node().value;
        //         console.log("enter fill")
        //         if (indicator == 'sedentary'){
        //             console.log("Adding new colore : ",indicator);
        //             return sedentary_color(d.tweets = healthIndex.get(d.properties.CDUID).num_tweets);
        //         }else if (indicator == 'sleep'){
        //             console.log("Adding new colore : ",indicator);
        //             return sleep_color(d.tweets = healthIndex.get(d.properties.CDUID).num_tweets);
        //         }else{
        //             console.log("Adding new colore : ",indicator);
        //             return pa_color(d.tweets = healthIndex.get(d.properties.CDUID).num_tweets);
        //         }
        //     })
        // }

        /*
           Bar chart
        */
        initBarchart();

        function initBarchart() {
            data = processedData;
            var keys = data.columns.slice(7);
            data = data.filter(function(d) {
                return d.division_name == 'Toronto';
            });

            var g = barchart.select("g").attr("transform",
                         "translate(" + margin.left + "," + margin.top + ")");

            x0.domain(data.map(function(d) { return d.division_name; }));
            x1.domain(keys).rangeRound([0, x0.bandwidth()]);
            y.domain([0, d3.max(data, function(d) {return d3.max(keys, function(key) { return d[key]; }); })]).nice();
          
            g.selectAll("g")
              .data(data)
              .enter().append("g")
              .attr("transform", function(d) { return "translate(" + x0(d.division_name) + ",0)"; })
              .selectAll("rect")
              .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
              .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x1(d.key); })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x1.bandwidth())
                .attr("height", function(d) { return bar_height - y(d.value); })
                .attr("fill", function(d) { return z(d.key); });
          
            g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + bar_height + ")")
                .call(d3.axisBottom(x0));
          
            g.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).ticks(null, "s"))
              .append("text")
                .attr("x", 2)
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "white")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .attr("transform", "translate(-35," +  (bar_height + margin.bottom)/2 + ") rotate(-90)")
                .text("# Tweets")
                .style("fill", "white");
          
            var legend = g.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "end")
              .selectAll("g")
              .data(keys.slice().reverse())
              .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
          
            legend.append("rect")
                .attr("x", bar_width - 19)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", z);
          
            legend.append("text")
                .attr("x", bar_width - 24)
                .attr("y", 9.5)
                .attr("dy", "0.42em")
                .text(function(d) { return d; })
                .style("fill", "white");    
        }

        function updateBarchart (division_id) {
            data = processedData;
            var keys = data.columns.slice(7);
            data = data.filter(function(d) {
                return d.division_id == division_id;
            });

            var bars = barchart.selectAll("g")
                               .remove()
                               .exit()
                               .data(data)

            var g = barchart.append("g").attr("transform",
                         "translate(" + margin.left + "," + margin.top + ")");

            x0.domain(data.map(function(d) { return d.division_name; }));
            x1.domain(keys).rangeRound([0, x0.bandwidth()]);
            y.domain([0, d3.max(data, function(d) {return d3.max(keys, function(key) { return d[key]; }); })]).nice();
          
            g.selectAll("g")
              .data(data)
              .enter().append("g")
              .attr("transform", function(d) { return "translate(" + x0(d.division_name) + ",0)"; })
              .selectAll("rect")
              .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
              .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x1(d.key); })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x1.bandwidth())
                .attr("height", function(d) { return bar_height - y(d.value); })
                .attr("fill", function(d) { return z(d.key); });
          
            g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + bar_height + ")")
                .call(d3.axisBottom(x0));
          
            g.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).ticks(null, "s"))
              .append("text")
                .attr("x", 20)
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .style("fill", "#fff")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .attr("transform", "translate(15," +  (bar_height + margin.bottom)/2 + ") rotate(-90)")
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
                .attr("x", bar_width - 19)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", z);
          
            legend.append("text")
                .attr("x", bar_width - 24)
                .attr("y", 9.5)
                .attr("dy", "0.42em")
                .attr("fill","white")
                .text(function(d) { return d; });    
        }        

    }

    // window.onload = function () {
    //    var radioButtons = document.getElementsByName("topic");
    //    for (var i = 0; radioButtons[i]; i++) 
    //      radioButtons[ i ].onclick = changeTopic;
    // };

    // function changeTopic () { 
    //     topic = this.value

    //     if(topic === 'physical'){
    //         population_color = d3.scaleThreshold()
    //                              .domain(population_domain)
    //                              .range(d3.schemeOranges[8]);              
    //     }else if(topic === 'sedentary'){
    //         population_color = d3.scaleThreshold()
    //                              .domain(population_domain)
    //                              .range(d3.schemeReds[8]);              
    //     }else{
    //         population_color = d3.scaleThreshold()
    //                              .domain(population_domain)
    //                              .range(d3.schemeBlues[8]);              
    //     }        
    // }


})();