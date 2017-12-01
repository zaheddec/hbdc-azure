(function() {
    var DEFAULTS = {
        height: 720,
        width: 1280,
        margin: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        }
    };

    // A line chart for health spending.
    var Choropleth = function(parentSelector, data, options, dict) {
        this.parentSelector = parentSelector;
        this.data = data;
        this.opts = _.defaultsDeep({}, options, DEFAULTS);
        this.healthIndex = dict;

        this.initVis();
    };

    Choropleth.prototype.initVis = function() {
        var vis = this;

        data = this.data;

        vis.margin = vis.opts.margin;

        vis.width = vis.opts.width - vis.margin.left - vis.margin.right;
        vis.height = vis.opts.height - vis.margin.top - vis.margin.bottom;        

        // SVG drawing area
        vis.svg = d3.select("#map")
                    .append("svg")
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        //var population_domain = [10000,100000,200000,300000,400000,500000,600000,900000];
        vis.population_domain = [0,2,200,300,400,1000,1500,2000];

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

        vis.tooltip = d3.select('#map').append('div')
                        .attr('class', 'hidden tooltip');

        /*
            Create projection
            + center (translate)
            + zoom (scale)
        */
        vis.projection = d3.geoAlbers()
                           .translate([vis.width/2.2, vis.height/.93])

        vis.path = d3.geoPath()
                     .projection(vis.projection);

        // Convert TopoJSON to GeoJSON
        vis.districts = topojson.feature(data, data.objects.gcd_000b11a_e_geo).features;

        vis.map = vis.svg.selectAll(".district")
                    .data(vis.districts)
                    .enter().append("path")
                    //.attr("class", "district")
                    .attr("d", vis.path)
                    .on("mouseover", function(d){
                        var mouse = d3.mouse(vis.svg.node()).map(function(d) {
                            return parseInt(d);
                        });

                        d3.select("#info").append("text").attr("id","province")
                        .text("Province: " + d.properties.PRNAME)
                        d3.select("#info").append("text").attr("id","city")
                        .text(" | City: " +     d.properties.CDNAME)
                        d3.select("#info").append("text").attr("id","population")
                        .text(" | Population: " + d.properties.CDUID)

                        d3.select(this).classed("selected", true);

                        vis.tooltip.classed('hidden', false)
                            .attr('style', 'left:' + (mouse[0] + 15) +
                                    'px; top:' + (mouse[1] - 35) + 'px')
                            .html(d.properties.CDNAME);
                    })
                    .on("mouseout", function(d){
                        d3.select("#province").remove();
                        d3.select("#city").remove();
                        d3.select("#population").remove();
                        d3.select(this).classed("selected", false);
                        vis.tooltip.classed('hidden', true);
                    })

        vis.updateVis();
    }


    Choropleth.prototype.updateVis = function () {

        vis = this;

        vis.map.attr("fill", function(d) { 
            vis.indicator = d3.select('input[name="topic"]:checked').node().value;
            if (vis.indicator == 'sedentary') {
                //console.log("Adding new colore : ",indicator);
                vis.legend_color = vis.sedentary_color;
                return vis.sedentary_color(d.tweets = vis.healthIndex.get(d.properties.CDUID).num_tweets);
            } else if (vis.indicator == 'sleep'){
                //console.log("Adding new colore : ",indicator);
                vis.legend_color = vis.sleep_color;
                return vis.sleep_color(d.tweets = vis.healthIndex.get(d.properties.CDUID).num_tweets);
            } else{
                //console.log("Adding new colore : ",indicator);
                vis.legend_color = vis.pa_color;
                return vis.pa_color(d.tweets = vis.healthIndex.get(d.properties.CDUID).physical_activity);
            }
        })
        
        // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
        vis.legend = vis.svg.append("svg")
                        .attr("class", "legend")
                        .attr("width", 100)
                        .attr("height", 400)
                        .selectAll("g")
                        .data(vis.legend_color.domain().slice().reverse())
                        .enter()
                        .append("g")
                        //.attr("transform", "translate(0,40)");
                        .attr("transform", function(d, i) { return "translate(5," + i * 20 + ")"; });

        vis.legend.append("rect")
                  .attr("id","lrect")
                  .attr("width", 18)
                  .attr("height", 18)
                  .style("fill", vis.legend_color);

        vis.legend.append("text")
                  .attr("id","ltext")
                  .data(vis.population_domain.reverse())
                  .attr("x", 24)
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .text(function(d) { return d + ' tweets'; });
    }

    if (!window.charts) { window.charts = {}; }
    window.charts.Choropleth = Choropleth;
})();