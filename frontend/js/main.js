(function() {
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
                    division_id: +d.division_id,
                    division_name: d.division_name,
                    province: d.province_name,
                    num_tweets: +d.num_tweets,
                    physical_activity: +d.physical_activity,
                    sedentary_behavior: +d.sedentary_behavior,
                    sleeping: +d.sleeping   
                }
                healthIndex.set(+d.division_id, dict);
                return dict
        })
        // check how we can get this data
        .defer(d3.json,"./data/yr_data.json")
    .await(ready)




    var barchart, choropleth;

    function ready(error, mapData,processedData,line_chart_data) {
        if (error) {
            console.log(error)
        }

        // console.log(districts)
        // console.log(processedData);
        // console.log(healthIndex);

        /*
            Select color based on indicator
        */
        d3.selectAll("input[name='topic']").on("change", function(){
            console.log("calling map update!! # ", this.value)
            d3.select("#ltext").remove();
            d3.select("#lrect").remove();
            choropletht.updateVis();
            choroplethg.updateVis();
            choroplethdt.updateVis();
            choroplethdg.updateVis();
        });

        initVis();

        // Render the obesity spending lines chart.
        function initVis () {
            var opts = {
                height: 400,
                width: 600,
                scale :650,
            };
            choropletht = new window.charts.Choropleth('#mapt', mapData, opts, healthIndex);
            choroplethg = new window.charts.Choropleth('#mapg', mapData, opts, healthIndex);
            
            //twitter map
            choroplethdt = new window.charts.Choropleth('#ttrend-map', mapData, {}, healthIndex);
            // linechartt = new window.charts.LineC('#tline-chart', line_chart_data, {});
            // barchartt = new window.charts.Bar('#bar-chart', processedData, {});
            // // To fix the chart on click
            // choropleth.map.on("click", function(d){
            //     barchartt.updateVis(d.properties.CDUID);
            // })
           
            //google trends map
            choroplethdg = new window.charts.Choropleth('#gtrend-map', mapData, {}, healthIndex);
            linechartg = new window.charts.LineC('#gline-chart', line_chart_data, {});
            //barchartg = new window.charts.Bar('#gtrend-line-chart', processedData, {});
            // To fix the chart on click
            // choropleth.map.on("click", function(d){
            //     barchartg.updateVis(d.properties.CDUID);
            // })
                    
            
            // add a compare chart to it
            linechartcomp = new window.charts.LineC('#compline-chart', line_chart_data, {});

        }
    }
})();