
var utils = require('../../lib/utils');

// A simple sine wave voice

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function SineII() {
    this.i = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

SineII.prototype.process = function(frequency) {
    this.i++;
    //frequency = frequency/sampleRate;
    var a1 = frequency * this.i * (utils.TAU/sampleRate);
    return Math.sin(a1);
};

module.exports = SineII;
