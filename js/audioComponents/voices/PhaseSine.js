var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// A phase distorting additive voice, combining modulation frequencies with a fundamental.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function PhaseSine() {
    this.v = 0;
    this.m1 = 0;
    this.m2 = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


PhaseSine.prototype.process = function(frequency,freq2,freq3,power,gain) {

    frequency = utils.arg(frequency,220);
    freq2 = utils.arg(freq2,110);
    freq3 = utils.arg(freq3,440);
    power = utils.arg(power,0.5);
    gain = utils.arg(gain,0.5);

    // fundamental wave //
    this.v += frequency/(sampleRate/4);
    if(this.v > 2) this.v -= 4;

    // modulation waves //
    this.m1 += freq2/(sampleRate/4);
    if(this.m1 > 2) this.m1 -= 4;

    this.m2 += freq3/(sampleRate/4);
    if(this.m2 > 2) this.m2 -= 4;


    // set power //
    var m1 = 1 - power + ((this.m1 * power)/2);
    var m2 = 1 - power + ((this.m2 * power)/2);

    // calculate & return //
    return (this.v * m1 * m2) * (2-Math.abs(this.v * m1 * m2)) * gain;
};



module.exports = PhaseSine;