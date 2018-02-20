
    var sleepHist = dc.barChart("#sleepHistDiv"),
        coffeeHist = dc.barChart("#coffeeHistDiv"), 
        coffeeSleepScatter = dc.scatterPlot("#coffeeSleepScatterDiv"), 
        coffeeSleepTimeSeries = dc.compositeChart("#coffeeSleepTimeSeriesDiv"), 
        visCount = dc.dataCount(".dc-data-count"),
        visTable = dc.dataTable(".dc-data-table");

    var url = "sleep.tsv";

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    d3.tsv(url, function (err, data) {
        // date	coffee	sleep
        // 2018,02,17	5	8
        
        if (err) throw err;
        
        // convert date string to a date object
        data.forEach(function (d) {
            d.sleep = +d.sleep;
            d.coffee = +d.coffee;
            d.date = new Date(d.date);
            d.day = days[d.date.getDay()];
        });

        var ndx = crossfilter(data); 
        var all = ndx.groupAll();			

        var sleepDimension = ndx.dimension(function(d) {return +d.sleep;});
        var sleepGroup = sleepDimension.group();

        var coffeeDimension = ndx.dimension(function(d) {return +d.coffee;});
        var coffeeGroup = coffeeDimension.group();

        var scatterDimension = ndx.dimension(function(d) {return [+d.coffee, +d.sleep];});
        var scatterGroup = scatterDimension.group();

        var daysDim = ndx.dimension(function (d) { return d.date; });
        var daysCoffeeGroup = daysDim.group().reduceSum(function(d) {return +d.coffee;});
        var daysSleepGroup = daysDim.group().reduceSum(function (d) { return +d.sleep; });

        sleepHist
            .dimension(sleepDimension)
            .group(sleepGroup)
            .x(d3.scale.linear().domain([0, 15]))				
            .elasticY(true)
            .xAxis().tickFormat();
        
        coffeeHist
            .dimension(coffeeDimension)
            .group(coffeeGroup)
            .x(d3.scale.linear().domain([0, 7]))
            .elasticY(true)
            .ordinalColors(["red"])
            .xAxis().tickFormat();
        
        coffeeSleepScatter
            .x(d3.scale.linear().domain([0, 10]))
            .y(d3.scale.linear().domain([0, 18]))
            .yAxisLabel("Hours of Sleep")
            .xAxisLabel("Cups of Coffee")
            .dimension(scatterDimension)
            .group(scatterGroup);

        coffeeSleepTimeSeries
            .width(960)
            .transitionDuration(500)
            .mouseZoomable(false)
            .dimension(daysDim)
            .x(d3.time.scale().domain([new Date(2018, 01, 01), new Date(2018, 02, 28)]))
            .elasticY(true)
            .elasticX(true)
            .shareTitle(false)
            .renderHorizontalGridLines(true)
            .legend(dc.legend().x(70).y(10).itemHeight(13).gap(5))
            .brushOn(false)
            .compose([
                dc.lineChart(coffeeSleepTimeSeries)
                    .group(daysSleepGroup, "Sleep Hours")
                    .valueAccessor(function (d) { return d.value; }).title(function (d) {
                        return d.key + "\nSleep: " + d.value;
                    })
                    .dashStyle([2, 2]), 
                dc.lineChart(coffeeSleepTimeSeries)						
                    .group(daysCoffeeGroup, "Coffee Cups")
                    .valueAccessor(function (d) { return d.value; }).title(function(d) {
                        return d.key + "\nCoffee: " + d.value;
                    })
                    .ordinalColors(["red"])

            ])
            .yAxisLabel("Count")
            .renderHorizontalGridLines(true);
            
        visCount
            .dimension(ndx)
            .group(all);
        visTable
            .dimension(daysDim)
            .group(function (d) {
        var format = d3.format('02d');
        return d.day;
    }).columns([
                "date",
                "coffee",
                "sleep", 
                "day"
                ]);
        dc.renderAll();
    });
