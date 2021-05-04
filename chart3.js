// set the dimensions of the canvas/graph
var width = 960;
var height = 500;
var margin = 100;
var padding = 0;
var adj = 100;


var svg3 = d3.select("div#container").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-" + adj + " -" + (adj / 3) + " " + (width + adj * 7) + " " + (height + adj * 2))
    .style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);

// General set up SVG adaptable size adapted from  https://datawanderings.com/2019/10/28/tutorial-making-a-line-chart-in-d3-js-v-5/ ""


//-----------------------------DATA------------------------------//
var timeConv = d3.timeParse("%Y-%m-%d");

var dataset = d3.csv("boardgame_ratings.csv");

// column names
var colNames = ["Catan=count", "Dominion=count", "Codenames=count", "Terraforming Mars=count", "Gloomhaven=count", "Magic: The Gathering=count", "Dixit=count", "Monopoly=count"]

var colNamesRank = ["Catan=rank", "Dominion=rank", "Codenames=rank", "Terraforming Mars=rank", "Gloomhaven=rank", "Magic: The Gathering=rank", "Dixit=rank", "Monopoly=rank"]
//game names
var gameNames = ["Catan", "Dominion", "Codenames", "Terraforming Mars", "Gloomhaven", "Magic: The Gathering", "Dixit", "Monopoly"]

dataset.then(function (data) {
    var slices = colNames.map(function (id, i) {
        return {
            id: id,
            names: gameNames[i],
            rankNames: colNamesRank[i],

            values: data.map(function (d) {
                return {
                    date: timeConv(d.date),
                    measurement: +d[id],
                    rank: +d[colNamesRank[i]]
                };
            })
        };
    });


    console.log("Column headers", data.columns);
    console.log("Column headers without date", data.columns.slice(1));
    console.log("Column headers without date and rank", colNames);
    // returns the sliced dataset
    console.log("Slices", slices);

    // returns the first slice
    console.log("First slice", slices[7]);
    // returns the array in the first slice
    console.log("A array", slices[7].values);
    // returns the date of the first row in the first slice
    console.log("Date element", slices[0].values[0].date);
    // returns the array's length
    console.log("Array length", (slices[0].values).length);
    //----------------------------SCALES-----------------------------//
    var xScale = d3.scaleTime().range([0, width]);

    var yScale = d3.scaleSqrt().rangeRound([height, 0]);

    xScale.domain(d3.extent(data, function (d) {
        return timeConv(d.date)
    }));

    yScale.domain([(0), d3.max(slices, function (c) {
        return d3.max(c.values, function (d) {
            return d.measurement;
        });
    })
    ]);

    console.log("maximum y value", d3.max(slices, function (c) {
        return d3.max(c.values, function (d) {
            return d.measurement;
        });
    }))
    //-----------------------------AXES------------------------------//
    var yaxis = d3.axisLeft()
        .scale(yScale);

    var xaxis = d3.axisBottom()
        .ticks(d3.timeMonth.every(3))
        .tickFormat(d3.timeFormat('%b %y'))
        .scale(xScale);



    //----------------------------LINES------------------------------//
    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    var line = d3.line()
        .x(function (d) { return xScale(d.date); })
        .y(function (d) { return yScale(d.measurement); });

    //-------------------------2. DRAWING----------------------------//

    //-----------------------------AXES------------------------------//
    svg3.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis)
        .append("text")
        .attr("dy", "4em")
        .attr("x", width / 2)
        .style("text-anchor", "middle")
        .style("font-size", "1.4em")
        .text("Month");

    svg3.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,0)")
        .call(yaxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "-5em")
        .attr("x", (-height / 2))
        .style("text-anchor", "middle")
        .style("font-size", "1.4em")
        .text("Num of Ratings");

    //----------------------------LINES------------------------------//
    var lines = svg3.selectAll(".lines")
        .data(slices)
        .enter()
        .append("g");

    lines.append("path")
        .attr("class", "gameIds")
        .attr("d", function (d) { console.log("line d", d); return line(d.values); })
        .style("stroke", d => colors(d.id))

    lines.append("text")
        .attr("class", "serie_label")
        .datum(function (d) {
            return {
                id: d.id,
                names: d.names,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function (d) {
            return "translate(" + (xScale(d.value.date) + 10)
                + "," + (yScale(d.value.measurement) + 5) + ")";
        })
        .attr("x", 5)
        .style("font-size", "1em")
        .style("fill", d => colors(d.id))
        .text(function (d) { return ("") + d.names; });


    //----------------------------circles------------------------------//





    var x = (function (d) {
        //console.log("sub x function temp", d)
        return xScale(d);
    });

    var y = (function (d) { return yScale(d); });



    //var newLine = lines.enter();

    lines.append("g").selectAll("circle")
        .data(function (d) { return d.values.filter(function (v) { return (d.id == "Catan=count" || d.id == "Codenames=count" || d.id == "Terraforming Mars=count" || d.id == "Gloomhaven=count") }) })
        .enter().append("circle")
        .filter(function (d, i) { if ((i + 1) % 3 == 0) { return d.measurement } })
        .attr("r", 13)
        .attr("cx", function (d) { return x(d.date); })
        .attr("cy", function (d) { return y(d.measurement); })
        .attr("data-legend", function (d) { return d.names })
        .attr("fill", function () { return colors(this.parentNode.__data__.id) });

    console.log("lines :", lines)

    lines.selectAll("text")
        .data(function (d) { return d.values.filter(function (v) { return (d.id == "Catan=count" || d.id == "Codenames=count" || d.id == "Terraforming Mars=count" || d.id == "Gloomhaven=count") }) })
        .enter().append("text")
        .filter(function (d, i) { if ((i + 1) % 3 == 0) { return d.measurement } })
        .attr("dx", function (d) { return x(d.date); })
        .attr("dy", function (d) { return y(d.measurement) + 4; })
        .style("text-anchor", "middle")
        .style("font-size", ".6em")
        .style("fill", "white")
        .text(function (d) { return d.rank })

    svg3.append("circle")
        .attr("cx", width + 70)
        .attr("cy", height)
        .attr("r", 13)
        .style("fill", "black")

    svg3.append("text")
        .attr("x", width + 70)
        .attr("y", height + 3)
        .text("rank")
        .style("font-size", ".7em")
        .style("text-anchor", "middle")
        .style("fill", "white")

    svg3.append("text")
        .attr("x", width + 70)
        .attr("y", height + 25)
        .text("BoardGameGeek Rank")
        .style("font-size", ".7em")
        .style("text-anchor", "middle")
        .style("fill", "black")

    svg3.append("text")
        .attr("x", (width / 2))
        .attr("y", -10)
        .text("Number of Ratings 2016-2020 (Square Root Scale)")
        .style("font-size", "1.4em")
        .style("text-anchor", "middle")
        .style("fill", "black")


});
