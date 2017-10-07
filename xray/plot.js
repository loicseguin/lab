function plot(x, y, svg) {
    var margin = {top: 20, right: 20, bottom: 30, left: 70};

    var width = 500;
        height = 300;

    var xScale = d3.scale.linear()
                   .domain(d3.extent(x))
                   .range([0, width - margin.left - margin.right]);
    var yScale = d3.scale.linear()
                   .domain(d3.extent(y))
                   .range([height - margin.top - margin.bottom, 0]);

    if (svg === undefined) {
        var svg = d3.select("#figures")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
        svg.append("g")
             .attr("class", "x axis")
             .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
             .call(d3.svg.axis().scale(xScale).orient("bottom"))
             .select(".domain");

        svg.append("g")
             .attr("class", "y axis")
             .call(d3.svg.axis().scale(yScale).orient("left"));
           //.append("text")
             //.attr("class", "label")
             //.attr("transform", "rotate(-90)")
             //.attr("x", -height/2)
             //.attr("y", -margin.left*0.8)
             //.attr("dy", ".71em")
             //.style("text-anchor", "middle")
             //.text("Intensité relative");
    }

    var line = d3.svg.line()
                 .x(function (d, i) { return xScale(d); })
                 .y(function (d, i) { return yScale(y[i]); });

    svg.append("path")
        .data([x])
        .attr("class", "line")
        .attr("d", line);

    return svg;
}
