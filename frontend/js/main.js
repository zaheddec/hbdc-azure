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
      .await(ready)

    var barchart, choropleth;

    function ready(error, mapData, processedData) {
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
            choropleth.updateVis();
        });

        initVis();

        // Render the obesity spending lines chart.
        function initVis () {
            barchart = new window.charts.Bar('#bar-chart', processedData, {});
            choropleth = new window.charts.Choropleth('#map', mapData, {}, healthIndex);
            choropleth.map.on("click", function(d){
                barchart.updateVis(d.properties.CDUID);
            })

        }
    }
})();