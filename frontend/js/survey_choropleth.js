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

    var SChoropleth = function(parentSelector, data, options, dict) {
        this.parentSelector = parentSelector;
        this.data = data;
        this.opts = _.defaultsDeep({}, options, DEFAULTS);
        this.healthIndexs = dict;

        this.initVis();
    };

    SChoropleth.prototype.initVis = function() {
        var viss = this;
        // map data
        data = this.data;
        viss.margin = viss.opts.margin;

        viss.width = viss.opts.width - viss.margin.left - viss.margin.right;
        viss.height = viss.opts.height - viss.margin.top - viss.margin.bottom;        

        // SVG drawing area
        viss.svg = d3.select(this.parentSelector)
            .append("svg")
            .attr("height", viss.height + viss.margin.top + viss.margin.bottom)
            .attr("width", viss.width + viss.margin.left + viss.margin.right)
            // .attr("height","100%")
            // .attr("width","100%")
            .append("g")
            .attr("transform", "translate(" + viss.margin.left + "," + viss.margin.top + ")");

        //var population_domain = [10000,100000,200000,300000,400000,500000,600000,900000];
        viss.population_domain = [0,2,5,10,30,50,80,100];

        // Define linear scale for output
        viss.pa_color = d3.scaleThreshold()
            .domain(viss.population_domain)
            .range(d3.schemeBlues[8]);              

        viss.sedentary_color = d3.scaleThreshold()
            .domain(viss.population_domain)
            .range(d3.schemeGreens[8]);

        viss.sleep_color = d3.scaleThreshold()
            .domain(viss.population_domain)
            .range(d3.schemeReds[8]);

        viss.legend_color = viss.pa_color;

        viss.tooltip = d3.select(this.parentSelector).append('div')
            .attr('class', 'hidden tooltip');

        /*
            Create projection
            + center (translate)
            + zoom (scale)
        */
        // console.log(viss.opts.scale);
        viss.projection = d3.geoAlbers()
            .translate([viss.width/2.2, viss.height/.93])
            .scale(viss.opts.scale)

        viss.path = d3.geoPath()
            .projection(viss.projection);

        // Convert TopoJSON to GeoJSON
        // viss.districts = topojson.feature(data, data.objects.gcd_000b11a_e_geo).features;
        viss.districts = topojson.feature(data, data.objects.canada_health_divisions).features;
        // console.log(viss.districts)
        viss.map = viss.svg.selectAll(".district")
            .data(viss.districts)
            .enter().append("path")
            //.attr("class", "district")
            .attr("d", viss.path)
            // .on("mouseover", function(d){
            //     viss.tooltip.classed('hidden', false)
            //         .style("left", (d3.event.pageX) + "px")
            //         .style("top", (d3.event.pageY -30) + "px")
            //         .text(d.properties.CDNAME+": "+d.properties.CDUID)
            // })
            // .on("mouseout", function(d){
            //     // d3.select(this).classed("selected", false);
            //     viss.tooltip.classed('hidden', true);
            // })

        viss.updateVis();
    }


    SChoropleth.prototype.updateVis = function () {

        viss = this;
        // console.log(viss.healthIndexs);
        viss.map.attr("fill", function(d) { 
            viss.indicator = d3.select('input[name="topic"]:checked').node().value;
            // add condition for date here
            // console.log(d)
            pa_list = viss.healthIndexs[d.properties.PR_HRUID]['Body mass index, self-reported, adult (18 years and over), overweight or obese (40,41,42,43)_Percent'];
            // console.log(pa_list instanceof Array);
            if(pa_list instanceof Array)
            {
                pa_survey = viss.healthIndexs[d.properties.PR_HRUID]['Body mass index, self-reported, adult (18 years and over), overweight or obese (40,41,42,43)_Percent'].slice(-1)[0];
                // console.log(pa_survey)
            }else{
                pa_survey = 0;
            }
            sedentary_list = viss.healthIndexs[d.properties.PR_HRUID]['Diabetes (22,23)_Percent'];
            if(sedentary_list instanceof Array){
                sedentary_survey = viss.healthIndexs[d.properties.PR_HRUID]['Diabetes (22,23)_Percent'].slice(-1)[0];
                // console.log(sedentary_survey)
            }else{
                sedentary_survey = 0;
            }
            sleep_list = viss.healthIndexs[d.properties.PR_HRUID]['Mood disorder (70)_Percent'];
            if(sleep_list instanceof Array){
                sleep_survey = viss.healthIndexs[d.properties.PR_HRUID]['Mood disorder (70)_Percent'].slice(-1)[0];    
                // console.log(sleep_survey)
            }else{
                sleep_survey = 0;
            }

            if (sedentary_survey == null) {
                sedentary_survey = 0;
            }
            if(pa_survey == null){
                pa_survey = 0;
            }
            if(sleep_survey == null){
                sleep_survey = 0;
            }
            if (viss.indicator == 'sedentary') {
                //console.log("Adding new colore : ",indicator);
                viss.legend_color = viss.sedentary_color;
                // console.log(d.tweets)
                return viss.sedentary_color(d.tweets = sedentary_survey);
            } else if (viss.indicator == 'sleep'){
                //console.log("Adding new colore : ",indicator);
                viss.legend_color = viss.sleep_color;
                return viss.sleep_color(d.tweets = sleep_survey);
            } else{
                //console.log("Adding new colore : ",indicator);
                viss.legend_color = viss.pa_color;
                return viss.pa_color(d.tweets = pa_survey);
            }
        })
        // 
        viss.map.on("mouseover", function(d){
            // latestData = viss.healthIndexs[d.properties.CDUID]['data'].slice(-1)[0]
            
            // console.log(viss.healthIndexs)
            // console.log(d.properties.PR_HRUID)
            var pa_list = viss.healthIndexs[d.properties.PR_HRUID]['Body mass index, self-reported, adult (18 years and over), overweight or obese (40,41,42,43)_Percent'];
            if(pa_list  instanceof Array)
            {
                pa_survey = viss.healthIndexs[d.properties.PR_HRUID]['Body mass index, self-reported, adult (18 years and over), overweight or obese (40,41,42,43)_Percent'].slice(-1)[0];
            }else{
                pa_survey = 0;
            }
            sedentary_list = viss.healthIndexs[d.properties.PR_HRUID]['Diabetes (22,23)_Percent'];
            if(sedentary_list  instanceof Array){
                sedentary_survey = viss.healthIndexs[d.properties.PR_HRUID]['Diabetes (22,23)_Percent'].slice(-1)[0];
            }else{
                sedentary_survey = 0;
            }
            sleep_list = viss.healthIndexs[d.properties.PR_HRUID]['Mood disorder (70)_Percent'];
            if(sleep_list instanceof Array){
                sleep_survey = viss.healthIndexs[d.properties.PR_HRUID]['Mood disorder (70)_Percent'].slice(-1)[0];    
            }else{
                sleep_survey = 0;
            }
            
            // console.log(pa_survey)
            if (sedentary_survey == null) {
                sedentary_survey = 0;
            }
            if(pa_survey == null){
                pa_survey = 0;
            }
            if(sleep_survey == null){
                sleep_survey = 0;
            }
            viss.tooltip.classed('hidden', false)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px")
                // .text(d.properties.CDNAME+": "+viss.healthIndexs.get(d.properties.CDUID).num_tweets)
                // .text(d.properties.CDNAME+": "+viss.healthIndexs.get(d.properties.CDUID).physical_activity)
                .html("<table class='tooltable'><tr><strong style= 'color=red'>"+ d.properties.ENG_LABEL+ "</strong></tr>"+
                    "<tr><td><strong>Physical Activity</strong></td><td><span>" + pa_survey + "</span></td></tr>"+
                    "<tr><td><strong>Sedentary Behavior </strong></td><td><span>" + sedentary_survey + "</span></td></tr>"+
                    "<tr><td><strong>Sleep              </strong></td><td><span>" + sleep_survey + "</span></td></tr></table>"
                  )
        })
        .on("mouseout", function(d){
            // d3.select(this).classed("selected", false);
            viss.tooltip.classed('hidden', true);
        })
        // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
        viss.legend_w = viss.width - 100;
        viss.legend = viss.svg.append("svg")
            .attr("class", "legend")
            .attr("width", viss.width)
            .attr("height", viss.height)
            // .attr("width", 100)
            // .attr("height", 400)
            .selectAll("g")
            .data(viss.legend_color.domain().slice().reverse())
            .enter()
            .append("g")
            //.attr("transform", "translate(0,40)");
            .attr("transform", function(d, i) { return "translate("+ viss.legend_w +"," + i * 20 + ")"; });

        viss.legend.append("rect")
            .attr("id","lrect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", viss.legend_color);
        
        viss.legend.append("text")
            .attr("id","ltext")
            .data(viss.population_domain.slice().reverse())
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) { return d ; });
        
    }

    if (!window.charts) { window.charts = {}; }
    window.charts.SChoropleth = SChoropleth;
})();