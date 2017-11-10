function compute() {
    // Compute the reflection and transmission probabilities as well as the
    // corresponding attenuations.
    var Z1, Z2;
    [Z1, Z2] = getImpedances();
    var pr = (Z1 - Z2)**2 / (Z1 + Z2)**2;
    var pt = 4 * Z1 * Z2 / (Z1 + Z2)**2;
    var betar = 10 * Math.log10(pr);
    var betat = 10 * Math.log10(pt);
    updateFields(pr, pt, betar, betat);
}

function getImpedances() {
    // Read the impedance values for the input fields.
    Z1 = +document.getElementById("impedance1").value;
    Z2 = +document.getElementById("impedance2").value;
    return [Z1, Z2];
}

function updateFields(pr, pt, betar, betat) {
    document.getElementById("pr").innerHTML =
        pr.toLocaleString(undefined, {minimumSignificantDigits: 5, maximumSignificantDigits: 6});
    document.getElementById("pt").innerHTML =
        pt.toLocaleString(undefined, {minimumSignificantDigits: 5, maximumSignificantDigits: 6});
    document.getElementById("betar").innerHTML =
        betar.toLocaleString(undefined, {minimumSignificantDigits: 5, maximumSignificantDigits: 6});
    document.getElementById("betat").innerHTML =
        betat.toLocaleString(undefined, {minimumSignificantDigits: 5, maximumSignificantDigits: 6});
}

compute();
