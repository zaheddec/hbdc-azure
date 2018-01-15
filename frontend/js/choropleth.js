(function() {
    var DEFAULTS = {
        height: 670,
        width: 1150,
        scale : 1100,
        margin: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        }
    };

    var Choropleth = function(parentSelector, data, options, dict,legend_text) {
        this.parentSelector = parentSelector;
        this.data = data;
        this.opts = _.defaultsDeep({}, options, DEFAULTS);
        this.healthIndex = dict;
        this.legend_text = legend_text;
        this.initVis();
    };

    Choropleth.prototype.initVis = function() {
        var vis = this;
        // map data
        data = this.data;
        vis.margin = vis.opts.margin;

        vis.width = vis.opts.width - vis.margin.left - vis.margin.right;
        vis.height = vis.opts.height - vis.margin.top - vis.margin.bottom;        

        // SVG drawing area
        vis.svg = d3.select(this.parentSelector)
            .append("svg")
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            // .attr("height","100%")
            // .attr("width","100%")
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        //var population_domain = [10000,100000,200000,300000,400000,500000,600000,900000];
        vis.population_domain = [0,2,50,100,300,500,800,1000];

        // Define linear scale for output
        vis.pa_color = d3.scaleThreshold()
            .domain(vis.population_domain)
            .range(d3.schemeBlues[8]);              

        vis.sedentary_color = d3.scaleThreshold()
            .domain(vis.population_domain)
            .range(d3.schemeGreens[8]);

        vis.sleep_color = d3.scaleThreshold()
            .domain(vis.population_domain)
            .range(d3.schemeReds[8]);

        vis.legend_color = vis.pa_color;

        vis.tooltip = d3.select(this.parentSelector).append('div')
            .attr('class', 'hidden tooltip');

        /*
            Create projection
            + center (translate)
            + zoom (scale)
        */
        // console.log(vis.opts.scale);
        vis.projection = d3.geoAlbers()
            .translate([vis.width/2.2, vis.height/.93])
            .scale(vis.opts.scale)

        vis.path = d3.geoPath()
            .projection(vis.projection);

        // Convert TopoJSON to GeoJSON
        // vis.districts = topojson.feature(data, data.objects.gcd_000b11a_e_geo).features;
        vis.districts = topojson.feature(data, data.objects.canada_health_divisions).features;
        // console.log(vis.districts)
        vis.map = vis.svg.selectAll(".district")
            .data(vis.districts)
            .enter().append("path")
            //.attr("class", "district")
            .attr("d", vis.path)
            // .on("mouseover", function(d){
            //     vis.tooltip.classed('hidden', false)
            //         .style("left", (d3.event.pageX) + "px")
            //         .style("top", (d3.event.pageY -30) + "px")
            //         .text(d.properties.CDNAME+": "+d.properties.CDUID)
            // })
            // .on("mouseout", function(d){
            //     // d3.select(this).classed("selected", false);
            //     vis.tooltip.classed('hidden', true);
            // })

        vis.updateVis();
    }


    Choropleth.prototype.updateVis = function () {

        vis = this;
        // console.log(vis.healthIndex);
        vis.map.attr("fill", function(d) { 
            vis.indicator = d3.select('input[name="topic"]:checked').node().value;
            // console.log(d)
            // add condition for date here 
            vis.date = d3.select("#date-select").property("value");
            // console.log(vis.date);
            // latestData = vis.healthIndex[d.properties.PR_HRUID]['data'].slice(-1)[0]
            dates_available = vis.healthIndex[d.properties.PR_HRUID]['data'].length
            var sedentary_tweets = 0;
            var pa_tweets = 0;
            var sleep_tweets = 0;
            if (dates_available == 0) {
                sedentary_tweets = 0;
                pa_tweets = 0;
                sleep_tweets = 0;
            } else {
                var found = 0;
                for (dt = 0; dt <dates_available; dt++){
                   if(vis.healthIndex[d.properties.PR_HRUID]['data'][dt].date == vis.date){
                        sedentary_tweets = vis.healthIndex[d.properties.PR_HRUID]['data'][dt].sedentary_behavior;
                        // console.log(sedentary_tweets)
                        pa_tweets = vis.healthIndex[d.properties.PR_HRUID]['data'][dt].physical_activity;
                        sleep_tweets = vis.healthIndex[d.properties.PR_HRUID]['data'][dt].sleep
                        found = 1;
                   }
                }
                if(!found){
                    sedentary_tweets = 0;
                    pa_tweets = 0;
                    sleep_tweets = 0;
                }
            }
            // console.log(sedentary_tweets)
            if (vis.indicator == 'sedentary') {
                //console.log("Adding new colore : ",indicator);
                vis.legend_color = vis.sedentary_color;
                return vis.sedentary_color(d.tweets = sedentary_tweets);
            } else if (vis.indicator == 'sleep'){
                //console.log("Adding new colore : ",indicator);
                vis.legend_color = vis.sleep_color;
                return vis.sleep_color(d.tweets = sleep_tweets);
            } else{
                //console.log("Adding new colore : ",indicator);
                vis.legend_color = vis.pa_color;
                return vis.pa_color(d.tweets = pa_tweets);
            }
        })
        // 
        vis.map.on("mouseover", function(d){
            // latestData = vis.healthIndex[d.properties.CDUID]['data'].slice(-1)[0]
            latestData = vis.healthIndex[d.properties.PR_HRUID]['data'].slice(-1)[0]
            if (latestData == null) {
                sedentary_tweets = 0;
                pa_tweets = 0;
                sleep_tweets = 0;
            } else {
                sedentary_tweets = latestData.sedentary_behavior;
                pa_tweets = latestData.physical_activity;
                sleep_tweets = latestData.sleep;
            }
            vis.tooltip.classed('hidden', false)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px")
                // .text(d.properties.CDNAME+": "+vis.healthIndex.get(d.properties.CDUID).num_tweets)
                // .text(d.properties.CDNAME+": "+vis.healthIndex.get(d.properties.CDUID).physical_activity)
                .html("<table class='tooltable'><tr><strong style= 'color=red'>"+ d.properties.ENG_LABEL+ "</strong></tr>"+
                    "<tr><td><strong>Physical Activity</strong></td><td><span>" + pa_tweets + "</span></td></tr>"+
                    "<tr><td><strong>Sedentary Behavior </strong></td><td><span>" + sedentary_tweets + "</span></td></tr>"+
                    "<tr><td><strong>Sleep              </strong></td><td><span>" + sleep_tweets + "</span></td></tr></table>"
                  )
        })
        .on("mouseout", function(d){
            // d3.select(this).classed("selected", false);
            vis.tooltip.classed('hidden', true);
        })
        // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
        vis.legend_w = vis.width - 100;
        vis.legend = vis.svg.append("svg")
            .attr("class", "legend")
            .attr("width", vis.width)
            .attr("height", vis.height)
            // .attr("width", 100)
            // .attr("height", 400)
            .selectAll("g")
            .data(vis.legend_color.domain().slice().reverse())
            .enter()
            .append("g")
            //.attr("transform", "translate(0,40)");
            .attr("transform", function(d, i) { return "translate("+ vis.legend_w +"," + i * 20 + ")"; });

        vis.legend.append("rect")
            .attr("id","lrect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", vis.legend_color);
        
        vis.legend.append("text")
            .attr("id","ltext")
            .data(vis.population_domain.slice().reverse())
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) { return d + vis.legend_text; });
        
    }

    if (!window.charts) { window.charts = {}; }
    window.charts.Choropleth = Choropleth;
})();