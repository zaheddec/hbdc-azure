(function() {
    var DEFAULTS = {
        height: 570,
        width: 960,
        margin: {
            top: 20,
            right: 60,
            bottom: 20,
            left: 40
        }
    };

    // A line chart for health spending.
    var LineC = function(parentSelector, data, options) {
        this.parentSelector = parentSelector;
        this.data = data;
        this.opts = _.defaultsDeep({}, options, DEFAULTS);
        //console.log(this.opts);
        this.initVis();
    };

    LineC.prototype.initVis = function() {    
        var vis = this;
        vis.margin = vis.opts.margin;

        // Make Canvas for different scores
        vis.linehcart = d3.select(vis.parentSelector).append("svg")
        .attr("width", vis.opts.width)                                                                                                                                                                                                           
        .attr("height", vis.opts.height)        
        vis.width = +vis.linehcart.attr("width") - vis.margin.left - vis.margin.right;
        vis.height =+vis.linehcart.attr("height") - vis.margin.top - vis.margin.bottom;
        //console.log(vis.linehcart)


        vis.parseTime = d3.timeParse("%Y")
        vis.bisectDate = d3.bisector(function(d) { return d.year; }).left;

        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        vis.chline = d3.line()
            .x(function(d) { return vis.x(d.year); })
            .y(function(d) { return vis.y(d.value); });

        vis.g = vis.linehcart.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        // console.log("vis.g before x axis")
        // console.log(vis.g)
            
        // vis.data = vis.vis.data;
        vis.data.forEach(function(d) {
            d.year = vis.parseTime(d.year);
            d.value = +d.value;
        });
        console.log(vis.data);

        vis.x.domain(d3.extent(vis.data, function(d) { return d.year; }));
        vis.y.domain([d3.min(vis.data, function(d) { return d.value; }) / 1.005, d3.max(vis.data, function(d) { return d.value; }) * 1.005]);

        vis.g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.x));
        // console.log()    
        // console.log(vis.g)

        vis.g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(vis.y).ticks(6).tickFormat(function(d) { return parseInt(d / 1000) + "k"; }))
            .append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .attr("fill", "#000")
            .text("# Tweets");

        vis.g.append("path")
            .datum(vis.data)
            .attr("class", "line")
            .attr("d", vis.chline);

        vis.focus = vis.g.append("g")
            .attr("class", "focus")
            .style("display", "none");

        vis.focus.append("line")
            .attr("class", "x-hover-line hover-line")
            .attr("y1", 0)
            .attr("y2", vis.height);

        vis.focus.append("line")
            .attr("class", "y-hover-line hover-line")
            .attr("x1", vis.width)
            .attr("x2", vis.width);

        vis.focus.append("circle")
            .attr("r", 7.5);

        vis.focus.append("text")
            .attr("x", 15)
            //.attr("fill","#000")
            .attr("dy", ".31em");

        vis.linehcart.append("rect")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .attr("class", "overlay")
            .attr("width", vis.width)
            .attr("height",vis.height)
            .on("mouseover", function() { vis.focus.style("display", null); })
            .on("mouseout", function() { vis.focus.style("display", "none"); })
            .on("mousemove", mousemove);

        function mousemove() {
            vis.x0 = vis.x.invert(d3.mouse(this)[0]),
            vis.i = vis.bisectDate(vis.data, vis.x0, 1),
            vis.d0 = vis.data[vis.i - 1],
            vis.d1 = vis.data[vis.i],
            vis.d = vis.x0 - vis.d0.year > vis.d1.year - vis.x0 ? vis.d1 : vis.d0;
            vis.focus.attr("transform", "translate(" + vis.x(vis.d.year) + "," + vis.y(vis.d.value) + ")");
            vis.focus.select("text").text(function() { return vis.d.value; });
            vis.focus.select(".x-hover-line").attr("y2", vis.height - vis.y(vis.d.value));
            vis.focus.select(".y-hover-line").attr("x2", vis.width + vis.width);
            }
        // function mousemove() {
        //     var x0 = vis.x.invert(d3.mouse(this)[0]),
        //     i = bisectDate(vis.data, x0, 1),
        //     d0 = vis.data[i - 1],
        //     d1 = vis.data[i],
        //     d = x0 - d0.year > d1.year - x0 ? d1 : d0;
        //     vis.focus.attr("transform", "translate(" + vis.x(d.year) + "," + vis.y(d.value) + ")");
        //     vis.focus.select("text").text(function() { return d.value; });
        //     vis.focus.select(".x-hover-line").attr("y2", vis.height - vis.y(d.value));
        //     vis.focus.select(".y-hover-line").attr("x2", vis.width + vis.width);
        // }
    }
    if (!window.charts) { window.charts = {}; }
    window.charts.LineC = LineC;
})();