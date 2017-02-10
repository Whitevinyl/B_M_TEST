var utils = require('../../lib/utils');
var common = require('../common/Common');

// Combines sine-waves as inharmonic overtones of the root frequency, using an array of
// ratios & gains. Resonance sets the power of the inharmonics, a value of 1 sets them all
// equal, 0.9 would set each harmonic a little weaker than the last, 1.1 would set each a
// little stronger than the last.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function InharmonicSine() {
    this.i = 0;
    this.partials = [];
}
var proto = InharmonicSine.prototype;

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(frequency,partials,resonance) {

    // init //
    frequency = utils.arg(frequency, 220);
    partials = utils.arg(partials, [new common.Inharmonic()]);
    resonance = utils.arg(resonance, 1);
    var out = 0;
    var totalLevel = 0;
    var m = 1;


    // progress time //
    this.i += 1/sampleRate;


    // loop through harmonics //
    var l = partials.length;
    for (var i=0; i<l; i++) {

        var f = frequency * partials[i].ratio;
        var f2 = (f*4)/sampleRate;
        var g = partials[i].gain;

        // if partial currently non-existent, zero it //
        if (!this.partials[i]) this.partials[i] = 0;

        // good frequency? //
        if (f<20000) {

            // calculate sine output //
            if (i>0) {
                m = Math.pow(resonance,i);
            }

            // calculate sine //
            this.partials[i] += f2;
            if(this.partials[i] > 2) this.partials[i] -= 4;
            var p = this.partials[i]*(2-Math.abs(this.partials[i]));

            // var p = Math.sin(f * (this.i * utils.TAU));

            out += ((p * g) * m);
            totalLevel += (Math.abs(g) * m);
        }
    }

    // normalise from partial total //
    out = out/totalLevel;

    return  out;
};

module.exports = InharmonicSine;
