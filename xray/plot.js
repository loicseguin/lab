function lineChart() {
    var margin = {top: 20, right: 20, bottom: 40, left: 60},
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom,
        xScale = d3.scaleLinear(),
        yScale = d3.scaleLinear(),
        xAxis = d3.axisBottom(xScale),
        yAxis = d3.axisLeft(yScale),
        xGrid = d3.axisBottom(xScale)
                    .tickSize(-height, 0, 0)
                    .tickFormat(""),
        yGrid = d3.axisLeft(yScale)
                    .tickSize(-width, 0, 0)
                    .tickFormat(""),
        colors = d3.scaleOrdinal(d3.schemeCategory10),
        g = null,
        x_axis_title = "",
        y_axis_title = "";

    function plot(selection) {

        selection.each(function(data) {

            // Update the x scale
            var domain = [
                d3.min([xScale.domain()[0], d3.min(data, function(d) { return d[0]; })]),
                d3.max([xScale.domain()[1], d3.max(data, function(d) { return d[0]; })])
            ];
            xScale
                .domain(domain)
                .range([0, width]);

            // Update the y scale
            domain = [
                d3.min([yScale.domain()[0], d3.min(data, function(d) { return d[1]; })]),
                d3.max([yScale.domain()[1], d3.max(data, function(d) { return d[1]; })])
            ];
            yScale
                .domain(domain)
                .range([height, 0]);

            // Select the svg element if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);
            var svgEnter = svg.enter().append("svg");

            // Otherwise create skeletal graph.
            var gEnter = svgEnter.append("g");
            gEnter.append("g").attr("class", "x grid");
            gEnter.append("g").attr("class", "y grid");
            gEnter.append("g").attr("class", "x axis");
            gEnter.append("g").attr("class", "y axis");

            // Update outer dimensions, ie, dimensions of the svg element.
            svg = svg.merge(svgEnter);
            svg.attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            // Update inner dimensions, ie, dimensions of g element.
            g = svg.select("g")
                .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

            // Update previous lines.
            updateLines();

            // Add the line path.
            var line = d3.line()
                .x(function (d) { return xScale(d[0]); })
                .y(function (d) { return yScale(d[1]); });
            var nlines = svg.selectAll(".line").size();
            g.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("id", "line" + nlines)
                .attr("d", line)
                .style("stroke", function() { return colors(nlines); });

            // Create grid lines.
            var duration = 0;
            if (nlines > 1) { duration = 1000; }
            g.select(".x.grid")
                .attr("transform", "translate(0," + height + ")")
                .transition()
                .duration(duration)
                .call(xGrid);

            g.select(".y.grid")
                .transition()
                .duration(duration)
                .call(yGrid);

            // Update the x-axis.
            g.select(".x.axis")
                .attr("transform", "translate(0," + yScale.range()[0] + ")")
                .transition()
                .duration(duration)
                .call(xAxis);
            g.select(".x.axis")
                .selectAll(".x.label")
                .data([x_axis_title])
                .enter()
                .append("text")
                .attr("class", "x label")
                .attr('x', width / 2)
                .attr('y', 30)
                .style('text-anchor', 'middle')
                .text(function(d) { return d; });

            // Update the y-axis.
            g.select(".y.axis")
                .transition()
                .duration(duration)
                .call(yAxis);
            g.select(".y.axis")
                .selectAll(".y.label")
                .data([y_axis_title])
                .enter()
                .append("text")
                .attr("class", "y label")
                .attr("transform", "rotate(-90)")
                .attr("x", -height/2)
                .attr("y", -40)
                .attr("dy", ".71em")
                .style("text-anchor", "middle")
                .text(function(d) { return d; });

        });
    }

    function updateLines() {
        g.selectAll(".line").each(function (d, i) {
            var line = d3.line()
                .x(function (d) { return xScale(d[0]); })
                .y(function (d) { return yScale(d[1]); });
            d3.select(this)
                .transition()
                .duration(1000)
                .attr("d", line);
        });
    }

    plot.xdomain = function(domain) {
        if (!arguments.length) {
            return xScale.domain();
        }
        xScale.domain(domain);
        // Redraw the lines
        if (g) {
            updateLines();
            // Update the x-axis.
            g.select(".x.axis")
                .call(xAxis);
        }
        return plot;
    };

    plot.ydomain = function(domain) {
        if (!arguments.length) {
            return yScale.domain();
        }
        yScale.domain(domain);
        // Redraw the lines
        if (g) {
            updateLines();
            // Update the y-axis.
            g.select(".y.axis")
                .call(yAxis);
        }
        return plot;
    };

    plot.update = function(data) {
        g.select(".line")
            .datum(data)
            .attr("d", d3.line()
                .x(function(d) { return xScale(d[0]); })
                .y(function(d) { return yScale(d[1]); }));
    };

    plot.xAxisLabel = function(val) {
        if (!arguments.length) {
            return x_axis_title;
        }
        x_axis_title = val;
        return plot;
    };

    plot.yAxisLabel = function(val) {
        if (!arguments.length) {
            return y_axis_title;
        }
        y_axis_title = val;
        return plot;
    };

    return plot;
}
