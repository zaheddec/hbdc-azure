(function() {
    //I increased the bottom margin a little bit because the x label is tied to it; so I could lower the x label a little bit
    var margin = {top: 50, right: 20, bottom: 60, left: 90},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var x = d3.time.scale()
    .range([0, width]);

    var y = d3.scale.linear()
    .range([height, 0]);

    var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.hours,24)
    //makes the xAxis ticks a little longer than the xMinorAxis ticks
    .tickSize(10)
    .orient("bottom");

    var xMinorAxis = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.hours,12)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

    var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.total_km); });

    var div = d3.select("body").append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);

    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //The format in the CSV, which d3 will read
    var parseDate = d3.time.format("%Y-%m-%d %X");

    //format for tooltip
    //https://github.com/mbostock/d3/wiki/Time-Formatting
    //var formatTime = d3.time.format("%e %b");
    var formatTime = d3.time.format("%e %b %-I:%M %p");
    var formatCount = d3.format(",");

    // function for the y grid lines
    function make_y_axis() {
        return d3.svg.axis()
        .scale(y)
        .orient("left")
        //.ticks(5)
    }

    var Line = function(parentSelector, data, options) {
        this.parentSelector = parentSelector;
        this.data = data;

        this.initVis();
    }

    // Intialize the vis.
    Line.prototype.initVis = function() {

    }

})();