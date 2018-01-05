(function() {
    var DEFAULTS = {
        height: 500,
        width: 960,
        margin: {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        }
    };

    // A line chart for health spending.
    var Bar = function(parentSelector, data, options) {
        this.parentSelector = parentSelector;
        this.data = data;
        this.opts = _.defaultsDeep({}, options, DEFAULTS);
        // console.log(this.opts);
        this.initVis();
    };

    Bar.prototype.initVis = function() {

        var vis = this;

        vis.margin = vis.opts.margin;

        vis.width = vis.opts.width - vis.margin.left - vis.margin.right;
        vis.height = vis.opts.height - vis.margin.top - vis.margin.bottom;        

        vis.barchart = d3.select(this.parentSelector).append("svg")
                                                     .attr("height", vis.opts.height)
                                                     .attr("width", vis.opts.width)

        vis.x0 = d3.scaleBand()
                   .rangeRound([0, vis.width])
                   .paddingInner(0.1);

        vis.x1 = d3.scaleBand()
                   .padding(0.05);

        vis.y = d3.scaleLinear()
                  .rangeRound([vis.height, 0]);

        vis.z = d3.scaleOrdinal()
                  .range(["#98abc5", "#6b486b", "#ff8c00"]);    

        // Display Toronto by default
        vis.updateVis(3520);
    }

    Bar.prototype.updateVis = function(division_id) {
        data = this.data;

        if (data[division_id]['data'].length == 0) {
            data[division_id]['data'] = [{
                "num_tweets": 0,
                "sedentary_behavior": 0,
                "sleeping": 0,
                "physical_activity": 0
            }]
        }

        data = [data[division_id]];
        var keys = ['sleeping', 'sedentary_behavior', 'physical_activity']

        var vis = this;

        vis.bars = vis.barchart.selectAll("g")
                            .remove()
                            .exit()
                            .data(data)

        vis.g = vis.barchart.append("g").attr("transform",
                        "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.x0.domain(data.map(function(d) { return d.division_name; }));
        vis.x1.domain(keys).rangeRound([0, vis.x0.bandwidth()]);
        vis.y.domain([0, d3.max(data, function(d) {return d3.max(keys, function(key) { return d['data'].slice(-1)[0][key]; }); })]).nice();
        
        vis.g.selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d) { return "translate(" + vis.x0(d.division_name) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return keys.map(function(key) { return {key: key, value: d['data'].slice(-1)[0][key]}; }); })
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return vis.x1(d.key); })
            .attr("y", function(d) { return vis.y(d.value); })
            .attr("width", vis.x1.bandwidth())
            .attr("height", function(d) { return vis.height - vis.y(d.value); })
            .attr("fill", function(d) { return vis.z(d.key); });
        
        vis.g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.x0));
        
        vis.g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(vis.y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", vis.y(vis.y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .attr("transform", "translate(-35," +  (vis.height + vis.margin.bottom)/2 + ") rotate(-90)")
            .text("# Tweets");
        
        vis.legend = vis.g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        
        vis.legend.append("rect")
            .attr("x", vis.width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", vis.z);
        
        vis.legend.append("text")
            .attr("x", vis.width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });    
    }        

    if (!window.charts) { window.charts = {}; }
    window.charts.Bar = Bar;

})();