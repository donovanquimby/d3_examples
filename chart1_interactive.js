// set the dimensions of the canvas/graph
// define the dimensions and margins for the graph
var margin = { top: 30, right: 20, bottom: 40, left: 75 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var barPadding = 2;

// appendSVG 
var svg = d3.select("div#container1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .classed("svg-content", true);

//-----------------------------DATA------------------------------//
var timeConv = d3.timeParse("%Y");

var dataset = d3.csv("average-rating.csv")

dataset.then(function (d, i) {
    d.forEach(x => x.users_rated = +x.users_rated)
    d.forEach(x => x.average_rating = +Math.floor(+x.average_rating))
    //d.forEach(x=>console.log("d",x.average_rating))
    var dataOrig = d;
    console.log("original", dataOrig)



    this.teamData = d3.nest()
        .key(function (d) { return d.year; })
        .key(function (d) { return d.average_rating; })
        .rollup(function (name) { return name.length; })
        .entries(d);
    for (var [yearkey, yearvalue] of Object.entries(this.teamData)) {



        var dummyData = function (year_V) {
            year_V.key = +year_V.key
            var rv = Array.from(Array(10).keys())
            rv.forEach(function (w) {
                var index = year_V.findIndex(x => x.key == w);
                index === -1 ? yearvalue.values.push({ key: w, value: 0 }) : void (0);
            }
            )
        };
        yearvalue.values.forEach(d => d.key = +d.key)
        dummyData(yearvalue.values);
        yearvalue.values.sort((a, b) => (a.key > b.key) ? 1 : -1) //sort by ratings
        yearvalue.values.forEach(d => d.year = yearvalue.key)

    };

    console.log("teamData Full", teamData);
    console.log("Counts", yearvalue.values)
    //----------------------------SCALES-----------------------------//
    // X-scale  
    var xScale = d3.scaleLinear().range([margin.left, width - margin.right]);

    xScale.domain(d3.extent(Object.keys(teamData).map(Number)));


    // Y-scale
    var max_y = 0; // variable for finding max y  

    for (var [yearkey, yearvalue] of Object.entries(this.teamData)) {
        var k = Math.max.apply(Math, yearvalue.values.map(function (d) { return d.value; }))
        if (k > max_y) {
            max_y = k
        };
    };

    var yScale = d3.scaleLinear().rangeRound([height, 100]);

    yScale.domain([0, max_y]);

    //---------------------Create AXES------------------------------//
    var yaxis = d3.axisLeft()
        .scale(yScale);

    var xaxis = d3.axisBottom()
        .scale(xScale);
    //----------------------------LINES------------------------------//
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var line = d3.line()
        .x(function (d) { return xScale(+d.key); })
        .y(function (d) { return yScale(d.value); });


    //-------------------------2. DRAWING----------------------------//

    //-----------------------------AXES------------------------------//
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(xaxis)
        .append("text")
        .attr("dy", "2.5em")
        .attr("x", (width) / 2)
        .style("text-anchor", "left")
        .style("font-size", "2em")
        .text("Rating");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yaxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "-2em")
        .attr("x", ((-height - 100) / 2))
        .style("text-anchor", "middle")
        .style("font-size", "2.0em")
        .style("alignment-baseline", "middle")
        .text("Count");


    //----------------------------LINES------------------------------//


    var lines = svg.selectAll(".lines")
        .data(teamData.filter(function (d) { return (d.key == "2015" || d.key == "2016" || d.key == "2017" || d.key == "2018" || d.key == "2019") })) //filter dates of interest
        .enter()
        .append("g");

    lines.append("path")
        .attr("d", function (d) { return line(d.values); })
        .style("stroke", d => color(d.key))



    var x = (function (d) {
        return (xScale(d))
            ;
    })


    var y = (function (d) {
        return (yScale(d.value))
            ;
    })

    lines.append("g").selectAll(".circle")
        .data(function (d) { return d.values })
        .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function (d) { return x(d.key) })
        .attr("cy", function (d) { return y(d) })
        .attr("fill", function () { return color(this.parentNode.__data__.key) })

        .on('mouseover', function (d, i) {
            // enlarge the mouse overed data point
            d3.select(this).transition()
                .duration('100')
                .attr("r", 17)

            console.log("color", this.attributes['fill'].value)
            var filterYear = this.__data__.year
            var filterRating = this.__data__.key
            var selection = dataOrig.filter(function (x) { return (x.average_rating == filterRating && x.year == filterYear) })
            var selection_sorted = selection.sort(function (a, b) { return (a.users_rated - b.users_rated) }).slice(1).slice(-5)

            console.log("sorted selection:", selection_sorted)

            if (selection_sorted.length != 0) {


                // append svg element to the body of the page and set dimensions and position of the svg element
                var svgBar = d3.select("div#container2").append("svg")
                    .attr("width", width + 150 + margin.right)
                    .attr("height", height - margin.top - margin.bottom)
                    .classed("svg-content", true);

                //---------------------Create AXES------------------------------//

                // create scales x & y for X and Y axis and set their ranges
                // add x-axis
                var y = d3.scaleBand()
                    .range([(height) / 2, 0])
                    .padding(0.1);

                var x = d3.scaleLinear()
                    .range([0, width / 2]);

                // scale domain
                x.domain([0, d3.max(selection_sorted.map(function (d) { return d.users_rated; }))])
                y.domain(selection_sorted.map(function (d) { return d.name.substring(0, 10); }));


                // add the x Axis
                var xAxisTicks = x.ticks().forEach(function (d) { if (d % 50 == 0) { return d; }; })
                let xAxisGenerator = d3.axisBottom(x)
                    .tickSize([-height / 2])
                    .tickSizeOuter(0)

                var xAxis = svgBar.append("g")
                    .attr("transform", "translate(150," + ((height / 2) + margin.bottom) + ")")
                    .call(xAxisGenerator)

                svgBar.append("text")
                    .attr("id", "x_axis_label")
                    .attr("text-anchor", "middle")
                    .attr("x", (width - 150) / 2)
                    .attr("y", ((height / 2) + margin.top + margin.bottom))
                    .style("font-size", "1em")
                    .text("Number of Users");

                // add the y Axis
                svgBar.append("g")
                    .attr("transform", "translate(150," + (margin.bottom) + ")")
                    .call(d3.axisLeft(y))
                    .append("text")

                svgBar.append("text")
                    .attr("id", "y_axis_label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 75)
                    .attr("x", ((-height + 150) / 2))
                    .style("text-anchor", "middle")
                    .style("font-size", "1.0em")
                    .text("Games");


                // append the rectangles for the bar chart

                svgBar.selectAll('.bar')
                    .attr("class", "bars")
                    .data(selection_sorted)
                    .enter()
                    .append('rect')
                    .attr("transform", "translate(0," + (margin.bottom) + ")")
                    .attr("width", function (d) { return x(d.users_rated); })
                    .attr("y", function (d) { return y(d.name.substring(0, 10)); })
                    .attr("x", 150)
                    .attr("height", y.bandwidth())
                    .attr("fill", "CadetBlue")
                    .style("opacity", 0.7);

                svgBar.append("text")
                    .attr("text-anchor", "middle")
                    .attr("x", (width - 150) / 2)
                    .attr("y", margin.top)
                    .style("font-size", "1em")
                    .text("Top 5 most rated games for year " + this.__data__.year + " with ratings " + this.__data__.key)



            }

            console.log("mouseOver Filtered:", selection_sorted);


        })

        .on('mouseout', function (d) {
            console.log("mouse Out Event")
            d3.select(this).transition()
                .duration('100')
                .attr("r", 5);
            d3.select("div#container2").html(null)

        })

        ;


    var filtData = teamData.filter(function (d) { return (d.key == "2015" || d.key == "2016" || d.key == "2017" || d.key == "2018" || d.key == "2019") })
    console.log(filtData)


    legendValues = ["2015", "2016", "2017", "2018", "2019"];

    svg.selectAll("legendDots")
        .data(legendValues)
        .enter(0)
        .append("circle")
        .attr("cx", 900)
        .attr("cy", function (d, i) { return 100 + (i * 25) })
        .attr("r", 7)
        .style("fill", x => color(x))

    svg.selectAll("legendLabels")
        .data(legendValues)
        .enter(0)
        .append("text")
        .attr("x", 920)
        .attr("y", function (d, i) { return 105 + (i * 25) })
        .style("fill", d => color(d))
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    svg.append("text")
        .attr("class", "title")
        .attr("x", ((width / 2) + margin.left))
        .attr("y", 50)
        .text("Board games by Rating 2015-2019")

    svg.append("text")
        .attr("class", "name")
        .attr("x", ((width / 2) + margin.left))
        .attr("y", 80)
        .text("")




}); // end of dataset.then()







