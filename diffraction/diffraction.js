function diffraction_envelope(y, lambda, a, L) {
    // Compute the relative intensity for a diffraction envelope (Franhofer
    // approximation) on a screen at a distance y from the center.
    //
    // Parameters
    // ----------
    // y: float
    //    Position on screen
    // lambda: float
    //    Wavelength of incident light
    // a: float
    //    Width of each slit
    // L: float
    //    Distance between slits and screen
    //
    var intensity = 1;
    var x = Math.PI * a * y / (lambda * L);

    if (x != 0) {
        intensity = Math.pow(Math.sin(x) / x, 2);
    }
    return intensity;
}

function relative_intensity(y, lambda, a, d, n, L) {
    // Compute the relative intensity for a diffraction pattern (Franhofer
    // approximation) on a screen at a distance y from the center.
    //
    // Parameters
    // ----------
    // y: float
    //    Position on screen
    // lambda: float
    //    Wavelength of incident light
    // a: float
    //    Width of each slit
    // d: float
    //    Distance between adjacent slits
    // n: integer
    //    Number of slits
    // L: float
    //    Distance between slits and screen
    //
    var x = Math.PI * a * y / (lambda * L);
    var z = Math.PI * y * d / (lambda * L);
    var sinx_over_x = 1;

    if (x != 0) {
        sinx_over_x = Math.sin(x) / x;
    }

    var intensity = Math.pow(sinx_over_x * Math.sin(n * z) / Math.sin(z), 2);
    return intensity;
}

function get_parameters() {
    // Return an array containing the physical parameters of the diffraction
    // experiment.  By default, assume 650 nm wavelength, 2 slits and a screen
    // that is at 1 m from the slits.
    var wavelengthSlider = document.getElementById("wavelengthSlider");
    var lambda = Number(wavelengthSlider.value) / 1000.0;

    var L = 1000000.0;

    var numberSlider = document.getElementById("numberSlitsSlider");
    var n = Number(numberSlider.value);

    var widthSlider = document.getElementById("slitWidthSlider");
    var a = Number(widthSlider.value);

    var sepSlider = document.getElementById("slitSepSlider");
    var d = Number(sepSlider.value);

    return [lambda, a, d, n, L];
}

function linspace(a, b, n) {
    // Generate an array of n equally spaced values between a and b.
    var arr = new Array(n);
    var step = (b - a) / (n - 1);
    for (var i = 0; i < n; i++)
        arr[i] = a + i * step;
    return arr;
}

function setup_plot_area() {
    // Create a default set of axis and set margins and sizes properly.

    // The xscale maps values in the domain to values in the range. Values in
    // the domain are distances along the screen whereas values in the range
    // are pixels in the SVG figure.
    xscale = d3.scale.linear()
        .domain([-10, 10])
        .range([0, width]);

    // The yscale maps values in the domain to values in the range. Values in
    // the domain are light intensity whereas values in the range are pixels
    // in the SVG figure.
    yscale = d3.scale.linear()
        .domain([0, 1])
        .range([height, 0]);

    // Define the horizontal axis (position along the screen).
    // Convert microns to mm for this axis.
    var distFormatter = d3.format(".0f");
    xAxis = d3.svg.axis()
        .scale(xscale)
        .orient("bottom")
        .tickFormat(function(d) { return distFormatter(d / 1000) });

    // Define the vertical axis (intensity).
    yAxis = d3.svg.axis()
        .scale(yscale)
        .ticks(0)
        .orient("left");

    // Create a svg figure with the proper sizes and margins.
    var svg = d3.select("#viscontainer").append("svg")
        .attr("width", 1030)
        .attr("height", 550)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // The diffraction pattern is drawn with the area between the curve and the
    // horizontal axis color filled.
    patternarea = d3.svg.area();
    svg.append("path")
      .attr("class", "patternarea")
      .attr("d", patternarea([]));

    // The diffraction envelope is drawn as a single line.
    diffractionline = d3.svg.line();
    svg.append("path")
      .attr("class", "diffractionline")
      .attr("d", diffractionline([]));

    // Add both axes to the figure. Add them after the graphs so that they are
    // drawn on top.
    svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + height + ")")
         .call(xAxis)
       .append("text")
         .attr("class", "label")
         .attr("x", width/2)
         .attr("y", 50)
         .style("text-anchor", "middle")
         .text("Distance sur l'écran (mm)");

    svg.append("g")
         .attr("class", "y axis")
         .call(yAxis)
       .append("text")
         .attr("class", "label")
         .attr("transform", "rotate(-90)")
         .attr("x", -height/2)
         .attr("y", -30)
         .attr("dy", ".71em")
         .style("text-anchor", "middle")
         .text("Intensité relative");
}

function plot_area(x, y) {
    // Plot the complete diffraction pattern as a filled curve.
    var svg = d3.select("svg");

    xscale.domain(d3.extent(x));

    patternarea
      .x(function(d, i) { return xscale(x[i]); })
      .y0(height)
      .y1(function(d, i) { return yscale(d); });
    svg.select(".patternarea")
      .attr("d", patternarea(y));
    svg.select(".x.axis")
      .call(xAxis);
    svg.select(".y.axis")
      .call(yAxis);
}

function plot_line(x, y) {
    // Plot the diffraction envelope as a line.
    var svg = d3.select("svg");

    xscale.domain(d3.extent(x));

    diffractionline
      .x(function(d, i) { return xscale(x[i]); })
      .y(function(d, i) { return yscale(d); });
    svg.select(".diffractionline")
      .attr("d", diffractionline(y));
    svg.select(".x.axis")
      .call(xAxis);
    svg.select(".y.axis")
      .call(yAxis);
}

function normalize(x) {
    // Scale the array so that the maximum value is 1.
    var maxval = 0;
    for (var i = 0; i < x.length; i++) {
        if (x[i] > maxval) {
            maxval = x[i];
        }
    }
    for (var i = 0; i < x.length; i++)
        x[i] /= maxval;
    return x;
}

function plot_diffraction(y0, y1, lambda, a, d, n, L) {
    // Compute and plot the diffraction pattern.
    var ny = 1000;
    var y = linspace(y0, y1, ny);

    var intensity = new Array(ny);
    for (var i = 0; i < ny; i++)
        intensity[i] = relative_intensity(y[i], lambda, a, d, n, L);
    normalize(intensity);
    plot_area(y, intensity);

    var diffraction = new Array(ny);
    for (var i = 0; i < ny; i++)
        diffraction[i] = diffraction_envelope(y[i], lambda, a, L);
    plot_line(y, diffraction)
}

function widthChanged() {
    // Validate the width value and plot the new pattern.
    var params = get_parameters();
    var lambda = params[0],
        a = params[1],
        d = params[2],
        n = params[3],
        L = params[4];

    if (a >= d) {
        if (d < 1000) {
            d = a + 10;
            document.getElementById("slitsep").innerHTML = d;
            document.getElementById("slitSepSlider").value = d;
        } else {
            a = d - 10;
            document.getElementById("slitWidthSlider").value = a;
        }
    }
    document.getElementById("slitwidth").innerHTML = a;

    plot_diffraction(ymin, ymax, lambda, a, d, n, L);
}

function distanceChanged() {
    // Validate the distance value and plot the new pattern.
    var params = get_parameters();
    var lambda = params[0],
        a = params[1],
        d = params[2],
        n = params[3],
        L = params[4];

    if (d <= a) {
        if (a > 10) {
            a = d - 10;
            document.getElementById("slitwidth").innerHTML = a;
            document.getElementById("slitWidthSlider").value = a;
        } else {
            d = a + 10;
            document.getElementById("slitSepSlider").value = d;
        }
    }
    document.getElementById("slitsep").innerHTML = d;

    plot_diffraction(ymin, ymax, lambda, a, d, n, L);
}

function wavelengthChanged() {
    // Just plot the pattern.
    var params = get_parameters();
    var lambda = params[0],
        a = params[1],
        d = params[2],
        n = params[3],
        L = params[4];

    document.getElementById("wavelength").innerHTML = lambda * 1000.0;
    plot_diffraction(ymin, ymax, lambda, a, d, n, L);
}

function numberSlitsChanged() {
    // Just plot the pattern.
    var params = get_parameters();
    var lambda = params[0],
        a = params[1],
        d = params[2],
        n = params[3],
        L = params[4];

    document.getElementById("numberslits").innerHTML = n;
    plot_diffraction(ymin, ymax, lambda, a, d, n, L);
}


var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    xscale,
    yscale,
    xAxis,
    yAxis,
    patternarea;
var ymin = -50000, ymax = 50000;

setup_plot_area();
wavelengthChanged();
