var x = d3.range(0, 10, 0.1);
var y = x.map(function (d) { return Math.sin(d); });
fig = plot(x, y)

x = d3.range(0, 30, 0.1);
y = x.map(function (d) { return Math.sin(d) + Math.cos(3*d) -2; });
plot(x, y, fig);
fig.selectAll("path")
   .attr("style", "stroke: #333");
