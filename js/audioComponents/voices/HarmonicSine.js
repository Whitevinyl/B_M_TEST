
var Tombola = require('tombola');
var tombola = new Tombola();

// Combines sine-waves as harmonic overtones of the root frequency, using an array of
// partials. Resonance sets the power of the partials, a value of 1 sets them all equal, 0.9
// would set each harmonic a little weaker than the last, 1.1 would set each a little
// stronger than the last.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function HarmonicSine() {
    this.v = 0;
    this.partials = [];
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

HarmonicSine.prototype.process = function(frequency,partials,resonance) {
    frequency = (frequency*4)/sampleRate;
    partials = partials || [1];

    // calculate fundamental sine //
    /*this.v += (frequency);
    if(this.v > 2) this.v -= 4;
    var out = this.v*(2-Math.abs(this.v));
    out *= partials[0];


    // overtones //
    var totalLevel = 1;
    for (var i=1; i<partials.length; i++) {

        // if partial currently non-existent, zero it //
        if (!this.partials[i]) this.partials[i] = 0;

        // good frequency? //
        if ((((frequency/4)*i)*sampleRate)<20000) {

            // calculate sine //
            this.partials[i] += (frequency*i);
            if(this.partials[i] > 2) this.partials[i] -= 4;
            var p = this.partials[i]*(2-Math.abs(this.partials[i]));

            var m = Math.pow(resonance,i+1);
            out += ((p*partials[i]) * m);
            totalLevel += (Math.abs(partials[i]) * m);
        }
    }*/


    var out = 0;

    // overtones //
    var totalLevel = 1;
    for (var i=0; i<partials.length; i++) {

        // if partial currently non-existent, zero it //
        if (!this.partials[i]) this.partials[i] = 0;

        // good frequency? //
        var fi = i + 1;
        if ((((frequency/4)*fi)*sampleRate)<20000) {

            // calculate sine //
            this.partials[i] += (frequency*fi);
            if(this.partials[i] > 2) this.partials[i] -= 4;
            var p = this.partials[i]*(2-Math.abs(this.partials[i]));

            var m = Math.pow(resonance,i+1);
            out += ((p*partials[i]) * m);
            totalLevel += (Math.abs(partials[i]) * m);
        }
    }





    // normalise from partial total //
    out = out/totalLevel;

    return  out;
};

module.exports = HarmonicSine;
