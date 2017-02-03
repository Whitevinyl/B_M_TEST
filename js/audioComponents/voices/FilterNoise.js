var utils = require('../../lib/utils');

// An adjustable noise algorithm which dials from very low frequency noise (like brown)
// to a high frequency metallic white noise.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function FilterNoise() {
    this.memory = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

FilterNoise.prototype.process = function(range,gain) {
    range = utils.arg(range,0.5) * 2;
    gain = utils.arg(gain,1);
    var r = this.memory + (Math.random()*(range*2)) - (range);
    r = utils.valueInRange(r,-1,1);
    this.memory = r;
    return r * gain;
};


module.exports = FilterNoise;