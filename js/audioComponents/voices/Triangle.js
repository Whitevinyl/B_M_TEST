var utils = require('../../lib/utils');

// A simple triangle wave voice, with phase start offset (click)

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Triangle(phaseOffset) {
    phaseOffset = utils.arg(phaseOffset,0);
    phaseOffset = utils.valueInRange(phaseOffset,0,1);

    this.a = 0;
    this.a -= phaseOffset;
    this.polarity = 1;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


// TRIANGLE //
Triangle.prototype.process = function(frequency) {
    // update voice value //
    var step = frequency * (4/sampleRate);
    this.a += (step * this.polarity);

    // stay within amplitude bounds //
    var spill = 0;
    if (this.a > 1) {
        spill = this.a - 1;
        this.a = 1 - spill;
        this.polarity = - this.polarity;
    }
    if (this.a < -1) {
        spill = (this.a + 1);
        this.a = (-1) - spill;
        this.polarity = - this.polarity;
    }
    return this.a;
};

module.exports = Triangle;