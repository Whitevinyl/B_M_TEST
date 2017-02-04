var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// White noise. BUT LOUDER. :)
//

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function LoudNoise() {
    this.polarity = 1;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

LoudNoise.prototype.process = function(power,gain) {
    if (tombola.percent(50)) {
        this.polarity = -this.polarity;
    }
    return ((power + (Math.random()*(1-power))) * this.polarity) * gain;
};


module.exports = LoudNoise;