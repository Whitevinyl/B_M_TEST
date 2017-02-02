var utils = require('../../lib/utils');

// A standard brown noise algorithm / each random number is related to the previous

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Brown() {
    this.memory = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

Brown.prototype.process = function(gain) {
    gain = utils.arg(gain,1);
    var white = Math.random() * 2 - 1;
    var total = (this.memory + (0.02 * white)) / 1.02;
    this.memory = total;
    total *= 3.5; // gain comp
    return total * gain;
};

module.exports = Brown;