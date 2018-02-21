var url = "./sleep.tsv";
var days = ['All', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


d3.select("#dropdown")
    .selectAll("option")
    .data(days)
    .enter()
    .append("option")
    .attr("value", function (day) { return day; })
    .text(function (day) { return day; });

d3.tsv(url, function (d) {
    d.sleep = +d.sleep;
    d.coffee = +d.coffee;
    d.date = new Date(d.date);
    d.day = days[d.date.getDay()+1];
    return d;
}, function (error, data) {

    if (error) throw error;

    // Calculate means
    sleepAvg = d3.mean(data, function (d) { return (d.sleep * 1); });
    sleepMax = d3.max(data, function(d) {return +d.sleep;});

    coffeeAvg = d3.mean(data, function (d) { return +d.coffee; });
    coffeeMax = d3.max(data, function(d) {return +d.coffee; })

    // Convert date string to a date object
    data.forEach(function (d) {
        d.sleepAvg = +sleepAvg;
        d.coffeeAvg = +coffeeAvg;
    });

    drawGraph(data);

    var dropDown = d3.select("#dropdown");
    dropDown.on("change", function () {
        var filtered_data = data;
        var selected_day = d3.event.target.value;
        if ("All" !== selected_day) {
            filtered_data = data.filter(function (d) {
                if (selected_day === d.day) {
                    return d;
                }
            });
        }
        if ("Saturday" === selected_day) {
            console.log(filtered_data);
        }
        d3.select('svg').selectAll("*").remove();
        drawGraph(filtered_data);
    });

    
});

var drawGraph = function(data) {

    // Recalculate means
    sleepAvg = d3.mean(data, function (d) { return (d.sleep * 1); });
    coffeeAvg = d3.mean(data, function (d) { return +d.coffee; });
    // Convert date string to a date object
    data.forEach(function (d) {
        d.sleepAvg = +sleepAvg;
        d.coffeeAvg = +coffeeAvg;
    });

    var svg = d3.select("svg");
    var margin = { top: 20, right: 50, bottom: 50, left: 50 };
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleTime().range([0, width]);
    var cScale = d3.scaleLinear().range([height, 0]);
    var sScale = d3.scaleLinear().range([height, 0]);

    var coffeeLine = d3.line()
        .x((d) => xScale(d.date))
        .y((d) => cScale(d.coffeeAvg));

    var sleepLine = d3.line()
        .x((d) => xScale(d.date))
        .y((d) => sScale(d.sleepAvg));

    svg.append("text")
        .attr("transform",
            "translate(" + ((width + margin.left + margin.right) / 2) + " ," +
            (height + margin.top + 40) + ")")
        .style("text-anchor", "middle")
        .text("Date");
    
    
    xScale.domain(d3.extent(data, (d) => d.date));
    cScale.domain([0, sleepMax]);
    sScale.domain([0, sleepMax]);
    

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .select(".domain")
        .remove();

    g.append("g")
        .call(d3.axisLeft(sScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", "-3em")
        .attr("text-anchor", "end")
        .text("Hours of sleep at night")
        .style("fill", "steelblue");

    g.append("g")
        .call(d3.axisRight(cScale))
        .attr("transform", "translate(" + width + "," + "0)")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -15)
        .attr("dy", "4.75em")
        .attr("text-anchor", "end")
        .text("Cups of coffee the next day")
        .style("fill", "red");

    g.append("path")
        .style("stroke", "red")
        .style("stroke-dasharray", ("3, 3"))
        .attr("d", coffeeLine(data))
        .attr("stroke-width", 1)
        .attr("fill", "none");

    g.selectAll(".coffee").data(data).enter().append("circle")
        .attr("class", "coffee")
        .attr("cx", function (d) { return xScale(d.date) })
        .attr("cy", function (d) { return cScale(d.coffee) })
        .attr("fill", "red")
        .on("mouseover", handleMouseOverCoffee)
        .on("mouseout", handleMouseOutCoffee)
        .attr("r", 2);

    g.append("path")
        .style("stroke", "steelblue")
        .style("stroke-dasharray", ("3, 3"))
        .attr("d", sleepLine(data))
        .attr("stroke-width", 1)
        .attr("fill", "none");

    g.selectAll(".sleep").data(data).enter().append("circle")
        .attr("class", "sleep")
        .attr("cx", function (d) { return xScale(d.date) })
        .attr("cy", function (d) { return sScale(d.sleep) })
        .attr("fill", "steelblue")
        .on("mouseover", handleMouseOverSleep)
        .on("mouseout", handleMouseOutSleep)
        .attr("r", 2);
}


var handleMouseOverSleep = function(d) {
    d3.select(this).style("fill", "orange");
    d3.select(this).attr("r", (d.sleep + 1) * 2);
    div.transition()
        .duration(200)
        .style("opacity", .9);
    div.html("Date: " + d.date.toLocaleDateString("en-US") + "<br/> Sleep: " + d.sleep) 
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");	
};

var handleMouseOverCoffee = function (d) {
    d3.select(this).style("fill", "orange");
    d3.select(this).attr("r", (d.coffee + 1) * 2);
    div.transition()
        .duration(200)
        .style("opacity", .9);
    div.html("Date: " + d.date.toLocaleDateString("en-US") + "<br/> Coffee:" + d.coffee)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
};

var handleMouseOutSleep = function(d) {
    d3.select(this).style("fill", "steelblue");
    d3.select(this).attr("r", 2);
    div.transition()
        .duration(500)
        .style("opacity", 0);	
};

var handleMouseOutCoffee = function (d) {
    d3.select(this).style("fill", "red");
    d3.select(this).attr("r", 2);
    div.transition()
        .duration(500)
        .style("opacity", 0);	
}