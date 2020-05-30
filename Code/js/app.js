//3-12 hairmetalconclusion 
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
//https://www.youtube.com/watch?v=E2737t3jh_c
//https://gramener.github.io/d3js-playbook/scatter.html
//https://www.d3-graph-gallery.com/graph/scatter_basic.html
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(healthcaredata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthcaredata, d => d[chosenXAxis]) * 0.8,
      d3.max(healthcaredata, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty:";
    label2 = "Healthcare:";

  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])  
    .html(function(d) {
    return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${label2} ${d.healthcare}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
    d3.select(this)
      .style("stroke", "black");
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
      d3.select(this)
        .style("stroke", "transparent");
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthcaredata, err) {
  if (err) throw err;

  // parse data
  healthcaredata.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    
    });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthcaredata, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthcaredata, d => d.healthcare) - 0.5, d3.max(healthcaredata, d => d.healthcare) + 2])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  //https://stackoverflow.com/questions/13615381/d3-add-text-to-circle
  https://stackoverflow.com/questions/13897534/add-names-of-the-states-to-a-map-in-d3-js
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthcaredata)
    .enter()
    .append("g");

  circlesGroup
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", "1.5");

  // Add state abbreviations text to circles
  circlesGroup
    .append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("font-size", "0.6em")
    .attr('dx', d => xLinearScale(d[chosenXAxis]))
    .attr('dy', d => yLinearScale(d.healthcare) + 4)
    .text(function(d) {
      return d.abbr
    });  

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");


  // Append y-axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");  

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthcaredata, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values - IS THIS WHERE PROBLEM IS, WHY CIRCLES NOT UPDATING????????????
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);


      }
    });
}).catch(function(error) {
  console.log(error);
});
