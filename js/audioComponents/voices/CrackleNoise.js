var utils = require('../../lib/utils');

// A bright crackle noise algorithm, like erratic phono dust & scratches or electrical
// glitches.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Crackle() {
    this.memory = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

Crackle.prototype.process = function(threshold,gain) {
    threshold = utils.arg(threshold,0.2);
    threshold /= 200;
    gain = utils.arg(gain,0.5);

    var white = (Math.random() * 2 - 1);
    if (Math.abs(white) > threshold) {
        white = this.memory;
    } else {
        this.memory = white;
        white *= (1/threshold);
    }
    return white * gain;
};


module.exports = Crackle;
