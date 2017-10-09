function normalPDF(x, mu, sigma) {
    if (mu === undefined) { mu = 0; }
    if (sigma === undefined) { sigma = 1; }

    var norm = 1 / (Math.sqrt(2 * Math.PI) * sigma);
    return norm * Math.exp(-((x - mu)**2) / (2 * sigma**2));
}

function characteristicSpectrum(photonEnergy) {
    // Characteristic spectrum of tungsten.
    var lineEnergy =
        [0.08, 0.52, 0.6, 2.2, 2.7, 2.8, 9.3, 11.5, 12, 12.1, 57.4,
         66.7, 68.9, 69.4, 69.5];
    var lineWidth =
        [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
         0.5, 0.5, 0.5];
    var relativeIntensity =
        [0.2, 0.1, 0.2, 0.2, 0.5, 0.5, 1, 1, 1, 1, 1.5, 1, 0.4,
         2, 0.5];

    var lineInfo = d3.zip(lineEnergy, lineWidth, relativeIntensity);

    var nbPhotons = photonEnergy.map(function(d) {
        return d3.sum(lineInfo.map(function(info) {
            return info[2] * normalPDF(d, info[0], info[1] / 4);
        }));
    });
    return nbPhotons;
}

function bremsstrahlungSpectrum(photonEnergy, n0, noiseSD) {
    if (n0 === undefined) { n0 = 100; }
    if (noiseSD === undefined) { noiseSD = 2; }
    var tubePotential = photonEnergy[photonEnergy.length - 1];

    // Number of photons with some random noise.
    var slope = -n0 / tubePotential;
    var nbPhotons = photonEnergy.map(function(d) {
        var noise = d3.randomNormal(0, noiseSD)();
        return n0 + slope * d + noise; 
    });

    return nbPhotons;
}

function genSpectrum(photonEnergy, n0, noiseSD) {
    if (n0 === undefined) { n0 = 100; }
    if (noiseSD === undefined) { noiseSD = 2; }

    var nbPhotons = bremsstrahlungSpectrum(photonEnergy, n0);
    var charSpec = characteristicSpectrum(photonEnergy);
    nbPhotons = nbPhotons.map(function(n, i) {
        return n + n / 10 * charSpec[i];
    });
    return d3.zip(photonEnergy, nbPhotons);
}

function addFigure(data) {
}

var tubePotential = [40, 55, 80, 100],
    n0s = [200, 100, 50, 300];

var datas = d3.zip(tubePotential, n0s)
    .map(function(d) {
        var photonEnergy = d3.range(0, d[0], 0.1);
        return genSpectrum(photonEnergy, d[1]);
    });

var nplots = 0;
var plot0 = lineChart()
    .xAxisLabel("Énergie des photons (keV)")
    .yAxisLabel("Nombre de photons");
d3.select("#figures")
    .append("div")
    .attr("id", "figure0")
    .data([datas[0]])
    .call(plot0);
nplots++;

d3.select("#addplot").on("click", function() {
    if (nplots < datas.length) {
        d3.select("#figure0")
            .data([datas[nplots]])
            .call(plot0);
        nplots++;
        d3.select("#delplot").attr("disabled", null);
    }
    if (nplots >= datas.length) {
        d3.select(this).attr("disabled", "disabled");
    }
});

d3.select("#delplot")
    .on("click", function() {
        nplots--;
        d3.select(".line#line" + nplots).remove()
        d3.select("#addplot").attr("disabled", null);

        if (nplots <= 0) {
            d3.select(this).attr("disabled", "disabled");
        }
    });


var photonEnergy = d3.range(0, 50, 0.1);
var n0 = 50;
var plot1 = lineChart()
    .xAxisLabel("Énergie des photons (keV)")
    .yAxisLabel("Nombre de photons")
    .xdomain([0, 100])
    .ydomain([0, 100]);
d3.select("#figures")
    .append("div")
    .attr("id", "figure1")
    .data([genSpectrum(photonEnergy, n0)])
    .call(plot1);
d3.select("#figure1")
    .append("input")
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", 100)
    .attr("id", "tubePotential")
    .on("input", function() {
        photonEnergy = d3.range(0, +this.value, 0.1);
        data = genSpectrum(photonEnergy, n0);
        plot1.update(data);
    });
d3.select("#figure1")
    .append("input")
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", 100)
    .attr("id", "n0")
    .on("input", function() {
        n0 = +this.value;
        data = genSpectrum(photonEnergy, n0);
        plot1.update(data);
    });
