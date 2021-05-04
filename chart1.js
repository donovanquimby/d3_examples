 // set the dimensions of the canvas/graph
 var width = 960;
 var height = 500;
 var margin = 100;
 var padding = 0;
 var adj = 100;


 var svg = d3.select("div#container").append("svg")
     .attr("preserveAspectRatio", "xMinYMin meet")
     .attr("viewBox", "-" + adj + " -" + (adj/3) + " " + (width + adj *7) + " "+ (height + adj*2))
     .style("padding", padding)
     .style("margin", margin)
     .classed("svg-content", true);

 // General set up SVG adaptable size adapted from  https://datawanderings.com/2019/10/28/tutorial-making-a-line-chart-in-d3-js-v-5/ ""

 //-----------------------------DATA------------------------------//
 var timeConv = d3.timeParse("%Y-%m-%d");

 var dataset = d3.csv("boardgame_ratings.csv");

 // column names
 var colNames = ["Catan=count", "Dominion=count", "Codenames=count", "Terraforming Mars=count","Gloomhaven=count","Magic: The Gathering=count", "Dixit=count","Monopoly=count"]
 
 //game names
 var gameNames = ["Catan", "Dominion", "Codenames", "Terraforming Mars","Gloomhaven","Magic: The Gathering", "Dixit","Monopoly"]

 dataset.then(function(data) {
    var slices = colNames.map(function(id,i) {
         return {
             id: id,
             names: gameNames[i],
             values: data.map(function(d){
                 return {
                     date: timeConv(d.date),
                     measurement: +d[id],
                 };
             })
         };
     });

 console.log("Column headers", data.columns);
 console.log("Column headers without date", data.columns.slice(1));
 console.log("Column headers without date and rank", colNames);
 // returns the sliced dataset
 console.log("Slices",slices);  
 // returns the first slice
 console.log("First slice",slices[7]);
 // returns the array in the first slice
 console.log("A array",slices[7].values);   
 // returns the date of the first row in the first slice
 console.log("Date element",slices[0].values[0].date);  
 // returns the array's length
 console.log("Array length",(slices[0].values).length);
 //----------------------------SCALES-----------------------------//
 var xScale = d3.scaleTime().range([0,width]);

 var yScale = d3.scaleLinear().rangeRound([height, 0]);

 xScale.domain(d3.extent(data, function(d){
     return timeConv(d.date)}));

 yScale.domain([(0), d3.max(slices, function(c) {
     return d3.max(c.values, function(d) {
         return d.measurement; });
         })
     ]);
 console.log("maximum y value", d3.max(slices, function(c) {
     return d3.max(c.values, function(d) {
         return d.measurement ; });
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
     .x(function(d) { return xScale(d.date); })
     .y(function(d) { return yScale(d.measurement); });

 //-------------------------2. DRAWING----------------------------//

 //-----------------------------AXES------------------------------//
 svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + height + ")")
     .call(xaxis)
     .append("text")
     .attr("dy", "4em")
     .attr("x", width/2)
     .style("text-anchor", "middle")
     .style("font-size","1.4em")
     .text("Month");

 svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0,0)")
     .call(yaxis)
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("dy", "-5em")
     .attr("x", (-height/2))
     .style("text-anchor", "middle")
     .style("font-size","1.4em")
     .text("Num of Ratings");
     
 //----------------------------LINES------------------------------//
 const lines = svg.selectAll("lines")
     .data(slices)
     .enter()
     .append("g");

 lines.append("path")
     .attr("class", "gameIds")
     .attr("d", function(d) { return line(d.values); })
     .style("stroke", d => colors(d.id))

 lines.append("text")
     .attr("class","serie_label")
     .datum(function(d) {
         return {
             id: d.id,
             names: d.names,
             value: d.values[d.values.length - 1]}; })
     .attr("transform", function(d) {
             return "translate(" + (xScale(d.value.date) + 10)  
             + "," + (yScale(d.value.measurement) + 5 ) + ")";})
     .attr("x", 5)
     .style("font-size","1em")
     .style("fill", d => colors(d.id))
     .text(function(d) { return ("") + d.names; });
     });

svg.append("text")
    .attr("x",(width/2))
    .attr("y",-10)
    .text("Number of Ratings 2016-2020")
    .style("font-size", "1.4em")
    .style("text-anchor", "middle")
    .style("fill", "black")