var utils = require('../../lib/utils');

// A simple sine wave voice, with phase start offset (click)

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Sine(phaseOffset) {
    phaseOffset = utils.arg(phaseOffset,0);
    phaseOffset = utils.valueInRange(phaseOffset,0,1);

    this.p = 2; // 2 = zero phase
    this.p -= phaseOffset;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

Sine.prototype.process = function(frequency) {
    frequency = (frequency*4)/sampleRate;

    var a = this.p*(2-Math.abs(this.p));

    this.p += frequency;
    if(this.p > 2) this.p -= 4;

    return a;
};

module.exports = Sine;