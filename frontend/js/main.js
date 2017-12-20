(function() {
    var healthIndex = d3.map(); 
    /*
        Read in map .topojson
        + .csv
    */
    d3.queue()
        //.defer(d3.json, "canada.topojson")
        .defer(d3.json, "data/gcd_000b11a_e_geo_10_topo.json")
        // check how we can get this data
        .defer(d3.json,"./data/yr_data.json")
        .defer(d3.json,"./data/yr_data_1.json")
        .defer(d3.csv,"./data/multichart.csv") //, function(d){
        //     d.year = +d.year;
        //     d.pa = +d.pa;
        //     d.sedantry = +d.sedantry;
        //     d.sleep = +d.sleep;
        //     d.income = +d.income;
        // })

    .await(ready)

    var barchart, choropleth;
    var quantizeSeq = d3.scaleQuantize()
        .range(d3.range(8).map(function (i) {
            return 'q' + i + '-8';
        }))
        .domain([0, 40000]);


    function ready(error, mapData, jsonData, line_chart_data, multiline_data) {
        if (error) {
            console.log(error)
        }

        // console.log(districts)
        // console.log(healthIndex);
        console.log(jsonData);

        /*
            Select color based on indicator
        */
        d3.selectAll("input[name='topic']").on("change", function(){
            console.log("calling map update!! # ", this.value)
            // d3.select("#ltext").remove();
            // d3.select("#lrect").remove();
            choropletht.updateVis();
            choroplethg.updateVis();
            choroplethdt.updateVis();
            choroplethdg.updateVis();
        });

        initVis();

        setBestTable(jsonData, null);

        // Render the charts
        function initVis () {
            var opts = {
                height: 450,
                width: 600,
                scale :580,
            };
            choropletht = new window.charts.Choropleth('#mapt', mapData, opts, jsonData);
            choroplethg = new window.charts.Choropleth('#mapg', mapData, opts, jsonData);
            
            //twitter map
            choroplethdt = new window.charts.Choropleth('#ttrend-map', mapData, {}, jsonData);
            barchartt = new window.charts.Bar('#bar-chartt', jsonData, {});
            linechartt = new window.charts.LineC('#tline-chart', line_chart_data, {});
            // To fix the chart on click
            choroplethdt.map.on("click", function(d){
                barchartt.updateVis(d.properties.CDUID);
            })
           
            //google trends map
            choroplethdg = new window.charts.Choropleth('#gtrend-map', mapData, {}, jsonData);
            barchartg = new window.charts.Bar('#bar-chartg', jsonData, {});
            //linechartg = new window.charts.LineC('#gline-chart', line_test, {});
            // To fix the chart on click
            choroplethdg.map.on("click", function(d){
                barchartg.updateVis(d.properties.CDUID);
            })
                    
            
            // add a compare chart to it
            multiline_data.forEach(function (d) {
                d.year = +d.year;
                d.pa = +d.pa;
                d.sedantry = +d.sedantry;
                d.sleep = +d.sleep;
                d.income = +d.income;
            });
            var chart = makeLineChart(multiline_data, 'year', {
                'pa': {column: 'pa'},
                'sedantry': {column: 'sedantry'},
                'sleep': {column: 'sleep'},
                'income': {column: 'income'}
            }, {xAxis: 'Years', yAxis: 'tweets'});
            chart.bind("#compline-chart");
            chart.render();
            // linechartcomp = new window.charts.LineC('#compline-chart', line_test, {});

        }
    }

    function setBestTable(data, date) {
        var _data = _(data).map(function(d) { 
            if (d.data.length == 0) { val = 0;} 
            else { val = d.data.slice(-1)[0].num_tweets;}
        
            return { 
                value: val,
                datum: d
            }
        }).sortBy('value').filter(function (d) {
            return d.value !== null;
            })        

        var highest = _data.takeRight(5).value().reverse();

        // Display in html
        $('#map-extremes').css('display', '');
        var rows = d3.select('#map-extremes table tbody').selectAll('tr')
            .data(highest);

        var newRows = rows.enter().append('tr');
        newRows.append('td')
            .html(function (pair, i) {
                return i + 1 + '.';
            });

        newRows.append('td').attr('class', 'best');

        newRows.select('.best')
            .html(function (pair) {
                var d = pair;
                var valBox = '<span class="seq valbox ' + quantizeSeq(d.value) + '"></span>&nbsp;';
                return valBox + d.datum.division_name + ': ' + d.value + '%';
            });

        rows.exit()
            .remove();

    }

})();