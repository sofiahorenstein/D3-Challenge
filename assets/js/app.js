// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 200,
  left: 100
};


var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var chart = d3
  .select("#scatter")
  .append("div")
  .classed("chart", true);

var svg = chart.append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var chosenXAxis = "healthcare";
var chosenYAxis = "income";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;

  }

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  
  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis,  newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis){
    textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "healthcare") {
    var xlabel = "Health Care:";
  }
  else if (chosenXAxis === "age"){
    var xlabel = "Median Age:"
  }
  else {
    var xlabel = "Smokers:";
  }
  if (chosenYAxis === "income") {
    var yLabel = "Income:"
  }
  else if (chosenYAxis === "obesity"){
    var yLabel = "Obesity: "
  }
  else {
    var yLabel = "Poverty:"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br> ${yLabel}${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(data, err) {
    if (err) throw err;

  // parse data
data.forEach(function(data) {
    data.healthcare = +data.healthcare;
    data.income= +data.income;
    data.age= +data.age;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
    data.poverty = +data.poverty;
  });

  // xLinearScale and yLinearScale functions above csv import
  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("opacity", ".5");
    
  var textGroup = chartGroup.selectAll(".stateText")
    .data(data)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", 3)
    .attr("font-size", "10px")
    .text(function(d){return d.abbr});


  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var healthcareLabel = xLabelsGroup.append("text")
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("% of People who Lack Health Care");

  var ageLabel = xLabelsGroup.append("text")
    .classed ("aText", true)
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("Median Age");

  var smokersLabel = xLabelsGroup.append("text")
    .classed ("aText", true)
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "smokes") 
    .classed("inactive", true)
    .text("% of People who Smoke");

  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left/4}, ${height/2})`);

  var incomeLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 0 - 80)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "income")
    .classed("active",true)
    .text("Median Household Income");

  var obesityLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 0 - 60)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("% of People with Obesity");

  var povertyLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("% of People in Poverty");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates text with x and y values 
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokersLabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else if (chosenXAxis=== "healthcare") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokersLabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokersLabel
            .classed("active", true)
            .classed("inactive", false);

          }
        }
    });

yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates x axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);

        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates text with x and y values 
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else if (chosenYAxis=== "income") {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
            .classed("active", true)
            .classed("inactive", false);

          }
        }
    });
});