var thecanvas = document.getElementById("thecanvas");
var thecontext = thecanvas.getContext("2d");

// Canvas to draw trail
var trailcanvas = document.getElementById("trailcanvas");
var trailcontext = trailcanvas.getContext("2d");

// Constants
var earthradius = 6371000;  // meters
var earthmass = 5.97e24;    // kilograms
var newtonG = 6.67e-11;     // gravitational constant in SI units
var mountainheight = earthradius * 0.165  // to match image

// Time step in seconds
var dt = 5;

// Conversion factor
var metersperpixel = earthradius / (0.355 * thecanvas.width);

// Position and velocity
var x, y, vx, vy;

// Timer
var timer;

// Readout for the speed slider
var speedreadout = document.getElementById("speedreadout");

function drawProjectile() {
    thecontext.clearRect(0, 0, thecanvas.width, thecanvas.height);
    thecontext.beginPath();
    pixelx = thecanvas.width/2 + x/metersperpixel;
    pixely = thecanvas.width/2 - y/metersperpixel;
    thecontext.arc(pixelx, pixely, 5, 0, 2*Math.PI);
    var thegradient = thecontext.createRadialGradient(
            pixelx-1, pixely-2, 1, pixelx, pixely, 5);
    thegradient.addColorStop(0, "#ffd0d0");
    thegradient.addColorStop(1, "#ff0000");
    thecontext.fillStyle = thegradient;
    thecontext.fill();
    trailcontext.fillRect(pixelx - 0.5, pixely - 0.5, 1, 1);
}

function moveProjectile() {
    var r = Math.sqrt(x*x + y*y);
    if (r > earthradius) {
        var accel = newtonG * earthmass / (r*r);  // magnitude of acceleration
        var ax = -accel * x / r;
        var ay = -accel * y / r;
        var lastx = x;
        vx += ax * dt;
        vy += ay * dt;
        x += vx * dt;
        y += vy * dt;
        drawProjectile();

        if (!(lastx < 0 && x >= 0)) {
            timer = window.setTimeout(moveProjectile, 10);
        }
    }
}

function fireProjectile() {
    window.clearTimeout(timer);
    // Initial conditions
    x = 0;      // meters
    y = earthradius + mountainheight;
    vx = Number(speedslider.value);  // meters per second
    vy = 0;
    moveProjectile();
}

function showSpeed() {
    speedreadout.innerHTML = speedslider.value;
}

function clearFigure() {
    thecontext.clearRect(0, 0, thecanvas.width, thecanvas.height);
    trailcontext.clearRect(0, 0, thecanvas.width, thecanvas.height);
}

