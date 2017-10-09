function normalPDF(x, mu, sigma) {
    // Evaluate the probability density function at `x` for a normal
    // distribution with mean `mu` and standard deviation `sigma`.
    // Default: standard normal distribution.
    if (mu === undefined) { mu = 0; }
    if (sigma === undefined) { sigma = 1; }

    var norm = 1 / (Math.sqrt(2 * Math.PI) * sigma);
    return norm * Math.exp(-((x - mu)**2) / (2 * sigma**2));
}

function characteristicSpectrum(photonEnergy) {
    // Characteristic spectrum of tungsten. Spectrum is normalized so that the
    // total number of photons is 1.
    var lineEnergy =
        [0.08, 0.52, 0.6, 2.2, 2.7, 2.8, 9.3, 11.5, 12, 12.1, 57.4,
         66.7, 68.9, 69.4, 69.5];
    var lineWidth =
        [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
         0.5, 0.5, 0.5];
    var relativeIntensity =
        [0.2, 0.1, 0.2, 0.2, 0.5, 0.5, 1, 1, 1, 1, 1.5, 1, 0.4,
         2, 0.5];

    var dE = photonEnergy[1] - photonEnergy[0];

    // Determine which lines are in the given energy interval.
    var eMax = photonEnergy[photonEnergy.length - 1];
    var index = lineEnergy.findIndex(function (d) { return d > eMax; });
    if (index < 0) {
        // All lines are included.
        index = photonEnergy.length - 1;
    } else {
        index = index - 1;
    }

    var norm = dE / d3.sum(relativeIntensity.slice(0, index));
    var lineInfo = d3.zip(lineEnergy.slice(0, index),
        lineWidth.slice(0, index),
        relativeIntensity.slice(0, index));
    var nbPhotons = photonEnergy.map(function(d) {
        return norm * d3.sum(lineInfo.map(function(info) {
            return info[2] * normalPDF(d, info[0], info[1] / 4);
        }));
    });
    return nbPhotons;
}

function bremsstrahlungSpectrum(photonEnergy) {
    // Compute Bremsstrahlung spectrum for the given photon energies. The
    // maximum energy is considered to be the last value in `photonEnergy`.
    // Spectrum is normalized so that the total number of photons is 1.
    var eMax = photonEnergy[photonEnergy.length - 1];
    var dE = photonEnergy[1] - photonEnergy[0];

    // Number of photons.
    var n0 = 2 * dE / eMax;
    var slope = -n0 / eMax;
    var nbPhotons = photonEnergy.map(function(d) {
        return n0 + slope * d; 
    });

    return nbPhotons;
}

function noiseSpectrum(photonEnergy, noiseSD) {
    // Generate gaussian noise with mean 0 and standard deviation `noiseSD`.
    if (noiseSD === undefined) { noiseSD = 1; }
    var nbPhotons = photonEnergy.map(function (d) {
         return d3.randomNormal(0, noiseSD)();
    });
    return nbPhotons;
}

function genSpectrum(photonEnergy, n0, charStrength, noiseSD) {
    // Compute a spectrum for the given photon energies. The number of photons
    // at the origin, ie, with 0 energy, is `n0`. The importance of
    // characteristic radiation relative to Bremsstrahlung radiation is
    // `charStrength`. For instance, a value of 0.01 for `charStrength` means
    // that the number of photons from characteristic radiation is 1% the
    // number of photons from Bremsstrahlung radiation.
    if (n0 === undefined) { n0 = 100; }
    if (charStrength === undefined) { charStrength = 0.01; }
    if (noiseSD === undefined) { noiseSD = 1; }

    var nbPhotons = bremsstrahlungSpectrum(photonEnergy);
    var charSpec = characteristicSpectrum(photonEnergy);
    var noise = noiseSpectrum(photonEnergy, noiseSD);
    var norm = n0 / nbPhotons[0];
    nbPhotons = nbPhotons.map(function(n, i) {
        var n = norm * (n + charStrength * charSpec[i]) + noise[i];
        return d3.max([0, n]);
    });
    return d3.zip(photonEnergy, nbPhotons);
}

//function fastSpectrum(photonEnergy, n0, charStrength, noiseSD) {
    //if (n0 === undefined) { n0 = 100; }
    //if (charStrength === undefined) { charStrength = 0.01; }
    //if (noiseSD === undefined) { noiseSD = 1; }

    //// Characteristic spectrum of tungsten. Spectrum is normalized so that the
    //// total number of photons is 1.
    //var lineEnergy =
        //[0.08, 0.52, 0.6, 2.2, 2.7, 2.8, 9.3, 11.5, 12, 12.1, 57.4,
         //66.7, 68.9, 69.4, 69.5];
    //var lineWidth =
        //[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
         //0.5, 0.5, 0.5];
    //var relativeIntensity =
        //[0.2, 0.1, 0.2, 0.2, 0.5, 0.5, 1, 1, 1, 1, 1.5, 1, 0.4,
         //2, 0.5];

    //// Determine which lines are in the given energy interval.
    //var eMax = photonEnergy[photonEnergy.length - 1];
    //var index = lineEnergy.findIndex(function (d) { return d > eMax; });
    //if (index < 0) {
        //// All lines are included.
        //index = photonEnergy.length - 1;
    //} else {
        //index = index - 1;
    //}

    //var dE = photonEnergy[1] - photonEnergy[0];
    //var yinter = 2 * dE / eMax;
    //var slope = -yinter / eMax;
    //var norm = null;
    //var charNorm = dE / d3.sum(relativeIntensity.slice(0, index));
    //var lineInfo = d3.zip(lineEnergy.slice(0, index),
        //lineWidth.slice(0, index),
        //relativeIntensity.slice(0, index));

    //var nbPhotons = photonEnergy.map(function(d) {
        //var nchar = charNorm * d3.sum(lineInfo.map(function(info) {
            //return info[2] * normalPDF(d, info[0], info[1] / 4);
        //}));
        //var nbremss = yinter + slope * d;
        //var noise = d3.randomNormal(0, noiseSD)();
        //if (!norm) { norm = n0 / nbremss; }
        //var n = norm * (d + charStrength * nchar) + noise;
        //return d3.max([0, n]);
    //});

    //return d3.zip(photonEnergy, nbPhotons);
//}


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


// benchmark
//genTimes = d3.range(0, 10000).map(function(d) {
    //var t0 = performance.now();
    //genSpectrum(photonEnergy);
    //var t1 = performance.now();
    //return t1 - t0;
//});
//fastTimes = d3.range(0, 10000).map(function(d) {
    //var t0 = performance.now();
    //fastSpectrum(photonEnergy);
    //var t1 = performance.now();
    //return t1 - t0;
//});

//console.log("genSpectrum:  ("
    //+ d3.mean(genTimes)
    //+ " ± "
    //+ d3.deviation(genTimes) + ") ms");
//console.log("fastSpectrum: ("
    //+ d3.mean(fastTimes)
    //+ " ± "
    //+ d3.deviation(fastTimes) + ") ms");

