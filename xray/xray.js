var electronChargeMantissa = 1.602 / 100;

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
        index = photonEnergy.length;
    } else {
        index = index;
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

function genSpectrum(photonEnergy, Etot, charStrength, noiseSD) {
    // Compute a spectrum for the given photon energies. The total energy of
    // the spectrum in **joules** is `Etot`.The proportion of characteristic
    // radiation in the total radiation is `charStrength`. For
    // instance, a value of 0.01 for `charStrength` means that the number of
    // photons from characteristic radiation is 1% of the total and the
    // remaining 99% is Bremsstrahlung radiation.
    //
    // The number of photons returned is divided by 1e14.
    if (n0 === undefined) { n0 = 100; }
    if (charStrength === undefined) { charStrength = 0.01; }
    if (noiseSD === undefined) { noiseSD = 1; }

    var nbPhotons = bremsstrahlungSpectrum(photonEnergy);
    var charSpec = characteristicSpectrum(photonEnergy);
    var noise = noiseSpectrum(photonEnergy, noiseSD);
    var eMax = photonEnergy[photonEnergy.length - 1];
    var n0 = 2 * Etot / (eMax * electronChargeMantissa);
    var norm = n0 / nbPhotons[0];
    var bremStrength = 1 - charStrength
    nbPhotons = nbPhotons.map(function(n, i) {
        var n = norm * (bremStrength * n + charStrength * charSpec[i]) + noise[i];
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

