(function() {
    var healthIndex = d3.map(); 
    var healthIndexs = d3.map(); 
    /*
        Read in map .topojson
        + .csv
    */
    d3.queue()
        //.defer(d3.json, "canada.topojson")
        // .defer(d3.json, "data/gcd_000b11a_e_geo_10_topo.json")
        .defer(d3.json, "./data/canada_health_divisions2011.json")
        .defer(d3.json,"./data/map_output.json")
        .defer(d3.json,"./data/HRUID_zahid_cansim_demographics.json")
        .defer(d3.json,"./data/Google_trends.json")
    .await(ready)


    var barchart, choropleth;
    var quantizeSeq = d3.scaleQuantize()
        .range(d3.range(8).map(function (i) {
            return 'q' + i + '-8';
        }))
        .domain([0, 100]);


    function ready(error, mapData, jsonData, surveyData,googleData) {
        if (error) {
            console.log(error)
        }

        console.log(jsonData)
        // console.log(surveyData);
        _.forEach(jsonData, function (d) {
            _.forEach(d.data, function(dd) {
                dd.sleeping_percent = dd.sleep / dd.num_tweets * 100;
                dd.sedentary_behavior_percent = dd.sedentary_behavior / dd.num_tweets * 100;
                dd.physical_activity_percent = dd.physical_activity / dd.num_tweets * 100;
            });
        });
        // console.log('Data Here:',jsonData);

        /*
            Select color based on indicator
        */
        d3.selectAll("input[name='topic']").on("change", function(){
            // console.log("calling map update!! # ", this.value)
            choropletht.updateVis();
            choroplethg.updateVis();
            choropleths.updateVis();
            choroplethdt.updateVis();
            choroplethdg.updateVis();
            setBestTable(jsonData, null, googleData, this.value);
            //compare
            // var div1 = '1101';
            // var div2 = '1102';
            multilineChart(jsonData,this.value);
            linechartt("#tline-chart",jsonData,this.value);
            linechartt("#gline-chart",googleData,this.value);
        });

        d3.selectAll("#date-select").on("change", function(){
            console.log("calling map update!! ", this.value)
            choropletht.updateVis();
            choroplethg.updateVis();
            // choropleths.updateVis();
            choroplethdt.updateVis();
            choroplethdg.updateVis();
            // setBestTable(jsonData, null, this.value);
            //compare
            // var div1 = '1101';
            // var div2 = '1102';
            // multilineChart(jsonData,this.value);
            // linechartt(jsonData,this.value);
        });

        // Compare
        d3.selectAll("button[id='compare-btn']").on("click", function(){
            // current values form select area
            // compare1 = d3.selectAll("select[id='compare-select1']").value;
            // compare2 = d3.selectAll("select[id='compare-select2']").value;
            compare1 = d3.select("#compare-select1").property("value")
            compare2 = d3.select("#compare-select2").property("value")
            
            // console.log('comaper1 value: ' + compare1)
            indicator = d3.selectAll("input[name='topic']").property("value");
            multilineChart(jsonData,indicator,compare1,compare2);
        });

        initVis();

        setBestTable(jsonData, null, googleData,'physical');

        // Render the charts
        function initVis () {
            var opts = {
                height: 450,
                width: 600,
                scale :580,
            };
            choropletht = new window.charts.Choropleth('#mapt', mapData, opts, jsonData,' Tweets');
            choroplethg = new window.charts.Choropleth('#mapg', mapData, opts, googleData,' RSV');
            choropleths = new window.charts.SChoropleth('#mapsurvey', mapData, opts, surveyData)
            //twitter map
            choroplethdt = new window.charts.Choropleth('#ttrend-map', mapData, {}, jsonData,' Tweets');

            // To fix the chart on click
            choroplethdt.map.on("click", function(d){
                barchartt.updateVis(d.properties.CDUID);
            })
           
            //google trends map
            choroplethdg = new window.charts.Choropleth('#gtrend-map', mapData, {}, googleData,' RSV');
            // barchartg = new window.charts.Bar('#bar-chartg', jsonData, {});
            //linechartg = new window.charts.LineC('#gline-chart', line_test, {});
            // To fix the chart on click
            choroplethdg.map.on("click", function(d){
                barchartg.updateVis(d.properties.CDUID);
            })
        
            // call multiline chart here
            multilineChart(jsonData,'physical');
            linechartt("#tline-chart",jsonData,'physical');
            linechartt("#gline-chart",googleData,'physical');
        }
    }

    function setBestTable(data, date, googleData, indicator) {

        radio2indicator = {'sleep': 'sleeping_percent',
                           'physical': 'physical_activity_percent',
                           'sedentary': 'sedentary_behavior_percent'};
        table_title = 
        d3.select('#map-extremes table thead').selectAll('th')
          .text('Best 5 (' + indicator + ')');                           
        indicator = radio2indicator[indicator];

        d3.select('#map-extremes table tbody').selectAll('tr').remove()
        
        // console.log('Displaying table', indicator);
        var _datat = _(data).map(function(d) { 
            if (d.data.length == 0) { val = 0;} 
            else { val = d.data.slice(-1)[0][indicator];}
        
            return { 
                value: val,
                datum: d
            }
        }).sortBy('value').filter(function (d) {
            return d.value !== null;
            })        

        var highest = _datat.takeRight(5).value().reverse();
        console.log(googleData)
        var _datag = _(googleData).map(function(d) { 
            
            if (d.data.length == 0) { val = 0;} 
            else { val = d.data.slice(-1)[0][indicator];}
        
            return { 
                value: val,
                datum: d
            }
        }).sortBy('value').filter(function (d) {
            return d.value !== null;
            })        

        var highesg = _datag.takeRight(5).value().reverse();
        console.log(highest);
        console.log(highesg)    
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
                // console.log(d.datum.ENG_LABEL)
                return valBox + d.datum.ENG_LABEL + ': ' + d.value.toFixed(2) + '%';
            });

        newRows.exit()
            .remove();

    }

    function multilineChart(jsonData,indicator,compare_division1='3595',compare_division2='2406'){
        // console.log(compare_division1+' : '+compare_division2)
        // console.log(jsonData);
        radio2indicator = {'sleep': 'sleep',
            'physical': 'physical_activity',
            'sedentary': 'sedentary_behavior'};

        // for logging valuess
        // var value='';
        // for (var key in jsonData) {
        //     value = value+key+','+jsonData[key].province+','+jsonData[key].ENG_LABEL+'<br />';
        // }
        // $("#select-data").html(value)

        indicator = radio2indicator[indicator];
        // compare_division1 = String(compare_division1)
        // compare_division2 = String(compare_division2)
        legend1 = jsonData[compare_division1].province + ' : ' + jsonData[compare_division1].ENG_LABEL
        legend2 = jsonData[compare_division2].province + ' : ' + jsonData[compare_division2].ENG_LABEL
        multiline_dt = [];
        object_data = {};
        compare_data1=jsonData[compare_division1]['data'];//.slice(-1)[0]
        compare_data2=jsonData[compare_division2]['data'];//.slice(-1)[0]
        div1_count = Object.keys(compare_data1).length;
        div2_count = Object.keys(compare_data2).length;
        // get the max
        var data_count;
        var data_process;
        // console.log(compare_data1)
        for (i=0;i<div1_count;i++){
            object_data = {};
            object_data.date = compare_data1[i].date
            // console.log(compare_data1[i].date)
            object_data.div1 = compare_data1[i][indicator]
            object_data.div2 = 0
            // console.log(object_data)
            multiline_dt.push(object_data)
        }
        // console.log(multiline_dt)
        for (i=0;i<div2_count;i++){
            object_data = {};
            found = 0;
            for(j=0;j<div1_count;j++){
                // console.log()
                if(multiline_dt[j].date == compare_data2[i].date){
                    multiline_dt[j].div2 = compare_data2[i][indicator];
                    found = 1;
                    break;
                }
            }
            if (found == 0){
                object_data = {};
                object_data.date = compare_data2[i].date
                // console.log(compare_data2[i].date)
                object_data.div1 = 0
                object_data.div2 = compare_data2[i][indicator]
                // console.log(object_data)
                multiline_dt.push(object_data)
            }
        }
        // console.log(multiline_dt)
        multiline_dt.sort(function(a,b){
            return b.date < a.date; 
            });
        
        line1_max = Math.max.apply(Math,multiline_dt.map(function(o){return o.div1;}));
        line2_max = Math.max.apply(Math,multiline_dt.map(function(o){return o.div2;}));
        if(line1_max > line2_max){
            line_max = line1_max;
        }else{
            line_max = line2_max;
        }
        // console.log(line_max);
        // normalize values
        multiline_dt.map(function(o){
                o.div1=(o.div1/line_max)*100;
                o.div2=(o.div2/line_max)*100;
            })    
        // console.log(multiline_dt);  
        var chart = makeLineChart(multiline_dt, 'date', {
            [legend1]: {column: 'div1'},   
            [legend2]: {column: 'div2'},
            }, {xAxis: 'Years', yAxis: 'tweets'});
        chart.bind("#compline-chart");
        chart.render();
    }

    function linechartt(selector,jsonData,indicator){
        radio2indicator = {'sleep': 'sleep',
            'physical': 'physical_activity',
            'sedentary': 'sedentary_behavior'};
        // console.log('twitter indicator :'+ indicator)
        indicator = radio2indicator[indicator];
        twitterData = [];
        j =0;
        // objectData = {};
        // console.log(jsonData);
        total_divs = Object.keys(jsonData).length;
        console.log(total_divs)
        // combine all object data on same date for a given indicator and add them all
        // for (div=0;div<total_divs;div++){
        var firstDate = 0;
        for (var div in jsonData){
            //add date, if data already exist just add to the exisiting value
            divData=jsonData[div]['data'];
            // console.log(div+':'+divData);
            divDataPoints = Object.keys(divData).length;
            for (dataPoint=0;dataPoint<divDataPoints;dataPoint++){
                twtDataLength = Object.keys(twitterData).length;
                if(firstDate == 0){
                    var objectData = {};
                        objectData.date = divData[dataPoint].date
                        objectData.tweets = divData[dataPoint][indicator]
                        twitterData.push(objectData);
                        firstDate =1;
                        // console.log(twitterData)
                }else{
                    var found = 0;
                    for (var twtData in twitterData){
                        // if(Object.keys(twitterData).length >= 50){
                        //     break;
                        // }
                        if (twitterData[twtData].date == divData[dataPoint].date){
                            twitterData[twtData].tweets = twitterData[twtData].tweets + divData[dataPoint][indicator];
                            found = 1;
                        }
                        // console.log(twitterData)
                    }
                    if(found ==0){
                        var objectData = {};
                        objectData.date = divData[dataPoint].date
                        objectData.tweets = divData[dataPoint][indicator]
                        twitterData.push(objectData);
                        // console.log('not found date :'+objectData.date)
                    }
                }
            }
        }
        // console.log(twitterData);
        twitterData.sort(function(a,b){
            return b.date < a.date; 
            });
        // console.log(twitterData); 
        if (selector=="#tline-chart"){
            yaxis = "Relevant Tweets Percentage"
        }else{
            yaxis ="Relative Search Volume"
        }
        line_max = Math.max.apply(Math,twitterData.map(function(o){return o.tweets;}));
        console.log(line_max);
        // normalize values
        twitterData.map(function(o){
            o.tweets=(o.tweets/line_max)*100;
        })
        var chartt = makeLineChart(twitterData, 'date', {
            'Canada Wide Date': {column: 'tweets'},   
            }, {xAxis: 'Date', yAxis: yaxis});
        chartt.bind(selector);
        chartt.render();
    }

})();