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


    var barchart;

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
            d3.select("#ltext").remove();
            d3.select("#lrect").remove();
            updateMap();
        });

        // for legend color
        var legend_color;

        initVis();

        // Render the obesity spending lines chart.
        function initVis () {
            barchart = new window.charts.Bar('#bar-chart', processedData, {});
        }

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
            .on("click", function(d){
                barchart.updateVis(d.properties.CDUID);
            })

            // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
            var legend = map.append("svg")
                            .attr("class", "legend")
                            .attr("width", 100)
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
                    .attr("dy", ".35em")
                    .text(function(d) { return d + ' tweets'; });
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

    }
})();