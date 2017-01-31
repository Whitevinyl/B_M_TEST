var utils = require('../../lib/utils');

// A warm static noise algorithm, like radio background noise, or consistent phono noise

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Static() {
    this.memory = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

Static.prototype.process = function(threshold,gain) {
    threshold = utils.arg(threshold,0.2);
    threshold /= 10;
    gain = utils.arg(gain,0.5);

    var white = (Math.random() * 2 - 1);
    if (Math.abs(white) > threshold) {
        white = this.memory;
    }
    this.memory = white;
    return white * gain;
};


module.exports = Static;
