function lineChart() {
    var margin = {top: 20, right: 20, bottom: 30, left: 70},
        width = 500,
        height = 300,
        xScale = d3.scaleLinear(),
        yScale = d3.scaleLinear(),
        xAxis = d3.axisBottom(xScale),
        yAxis = d3.axisLeft(yScale),
        colors = d3.scaleOrdinal(d3.schemeCategory10),
        lines = []
        g = null;

    function plot(selection) {

        selection.each(function(data) {

            // Update the x scale
            var domain = [
                d3.min([xScale.domain()[0], d3.min(data, function(d) { return d[0]; })]),
                d3.max([xScale.domain()[1], d3.max(data, function(d) { return d[0]; })])
            ];
            xScale
                .domain(domain)
                .range([0, width - margin.left - margin.right]);

            // Update the y scale
            domain = [
                d3.min([yScale.domain()[0], d3.min(data, function(d) { return d[1]; })]),
                d3.max([yScale.domain()[1], d3.max(data, function(d) { return d[1]; })])
            ];
            yScale
                .domain(domain)
                .range([height - margin.top - margin.bottom, 0]);

            // Select the svg element if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);
            var svgEnter = svg.enter().append("svg");

            // Otherwise create skeletal graph.
            var gEnter = svgEnter.append("g");
            gEnter.append("g").attr("class", "x axis");
            gEnter.append("g").attr("class", "y axis");

            // Update outer dimensions, ie, dimensions of the svg element.
            svg = svg.merge(svgEnter);
            svg.attr("width", width)
                .attr("height", height);

            // Update inner dimensions, ie, dimensions of g element.
            g = svg.select("g")
                .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

            // Update previous lines.
            g.selectAll(".line").each(function (d, i) {
                lines[i].x(function(d) { return xScale(d[0]); })
                        .y(function(d) { return yScale(d[1]); });
                d3.select(this).transition()
                    .duration(1000)
                    .attr("d", lines[i]);
            });

            // Add the line path.
            var line = d3.line()
                .x(function (d) { return xScale(d[0]); })
                .y(function (d) { return yScale(d[1]); });
            g.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line)
                .style("stroke", function() { return colors(lines.length); });
            lines.push(line);

            // Update the x-axis.
            g.select(".x.axis")
                .attr("transform", "translate(0," + yScale.range()[0] + ")")
                .transition()
                .duration(1000)
                .call(xAxis);

            // Update the y-axis.
            g.select(".y.axis")
                .transition()
                .duration(1000)
                .call(yAxis);
        });
    }

    plot.xdomain = function(domain) {
        xScale.domain(domain);
        // Redraw the lines
        g.selectAll(".line").each(function (d, i) {
            lines[i].x(function(d) { return xScale(d[0]); });
            d3.select(this).transition()
                .duration(1000)
                .attr("d", lines[i]);
        });
        // Update the x-axis.
        g.select(".x.axis")
            .transition()
            .duration(1000)
            .call(xAxis);
    };

    plot.ydomain = function(domain) {
        yScale.domain(domain);
        // Redraw the lines
        g.selectAll(".line").each(function (d, i) {
            lines[i].y(function(d) { return yScale(d[1]); });
            d3.select(this).transition()
                .duration(1000)
                .attr("d", lines[i]);
        });
        // Update the y-axis.
        g.select(".y.axis")
            .transition()
            .duration(1000)
            .call(yAxis);
    };

    return plot;
}
