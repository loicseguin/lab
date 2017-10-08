var nfigures = 0;

function addFigure() {
    var plot = lineChart()
    d3.select("#figures")
        .append("div")
        .attr("id", "figure" + nfigures)
        .data([data])
        .call(plot);
    nfigures++;

    return plot;
}

var x = d3.range(0, 10, 0.1);
var y = x.map(function (d) { return Math.sin(d); });
data = d3.zip(x, y);
var plot = addFigure();

d3.select("#changedomain").on("click", function() {
    plot.xdomain([0, 40 * Math.random()]);
    plot.ydomain([-15 * Math.random(), 15 * Math.random()]);
});

d3.select("#addplot").on("click", function() {
    //plot.xdomain(0, 40 * Math.random());
    x = d3.range(0, 30 * Math.random(), 0.1);
    y = x.map(function(d) { return Math.cos(2*Math.random()*d) + 1.3*Math.random() * Math.sin(0.8*d); });
    data = d3.zip(x, y);
    d3.select("#figure0")
        .data([data])
        .call(plot);
});

d3.select("#addfigure").on("click", addFigure);
