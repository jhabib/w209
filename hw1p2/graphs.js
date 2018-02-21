
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
        
        // Calculate means
        sleepAvg = d3.mean(data, function (d) { return (d.sleep*1); });
        coffeeAvg = d3.mean(data, function (d) { return +d.coffee; });

        // Convert date string to a date object
        data.forEach(function (d) {
            d.sleep = +d.sleep;
            d.coffee = +d.coffee;
            d.date = new Date(d.date);
            d.day = days[d.date.getDay()];
            d.sleepAvg = +sleepAvg;
            d.coffeeAvg = +coffeeAvg;
        });

        var ndx = crossfilter(data); 
        var all = ndx.groupAll();

        var dayDim = ndx.dimension(function (d) { return d.day });
        var dayDimGroup = dayDim.group();
        dayDimGroup.top(Infinity).forEach(function (d, i) {
            console.log(d.key + ': ' + d.value);
        });

        dayDim.filterExact("Sunday");
        dayDim.top(Infinity).forEach(function(d, i) {
            console.log(d.coffee + ": " + d.sleep);
        });
        dayDim.filterAll();

        // Create dc.js charts here 
        var sleepDimension = ndx.dimension(function(d) {return +d.sleep;});
        var sleepGroup = sleepDimension.group();
        sleepHist
            .dimension(sleepDimension)
            .group(sleepGroup)
            .x(d3.scale.linear().domain([0, 15]))				
            .elasticY(true)
            .xAxis().tickFormat();
        
        var coffeeDimension = ndx.dimension(function (d) { return +d.coffee; });
        var coffeeGroup = coffeeDimension.group();
        coffeeHist
            .dimension(coffeeDimension)
            .group(coffeeGroup)
            .x(d3.scale.linear().domain([0, 7]))
            .elasticY(true)
            .ordinalColors(["red"])
            .xAxis().tickFormat();

        var scatterDimension = ndx.dimension(function (d) { return [+d.coffee, +d.sleep]; });
        var scatterGroup = scatterDimension.group();
        coffeeSleepScatter
            .x(d3.scale.linear().domain([0, 10]))
            .y(d3.scale.linear().domain([0, 18]))
            .yAxisLabel("Hours of Sleep")
            .xAxisLabel("Cups of Coffee")
            .dimension(scatterDimension)
            .group(scatterGroup);
        
        var dateDim = ndx.dimension(function (d) { return d.date; });
        var dateCoffeeGroup = dateDim.group().reduceSum(function (d) { return +d.coffee; });
        var dateSleepGroup = dateDim.group().reduceSum(function (d) { return +d.sleep; });
        coffeeSleepTimeSeries
            .width(960)
            .transitionDuration(500)
            .mouseZoomable(false)
            .dimension(dateDim)
            .x(d3.time.scale().domain([new Date(2018, 01, 01), new Date(2018, 02, 28)]))
            .elasticY(true)
            .elasticX(true)
            .shareTitle(false)
            .renderHorizontalGridLines(true)
            .legend(dc.legend().x(70).y(10).itemHeight(13).gap(5))
            .brushOn(false)
            .compose([
                dc.lineChart(coffeeSleepTimeSeries)
                    .group(dateSleepGroup, "Sleep Hours")
                    .valueAccessor(function (d) { return d.value; }).title(function (d) {
                        return d.key + "\nSleep: " + d.value;
                    })
                    .dashStyle([2, 2]), 
                dc.lineChart(coffeeSleepTimeSeries)						
                    .group(dateCoffeeGroup, "Coffee Cups")
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
            .dimension(dateDim)
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
