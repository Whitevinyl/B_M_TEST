
var utils = require('../../lib/utils');

// A simple sine wave voice

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Triangle() {
    this.a = 0;
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