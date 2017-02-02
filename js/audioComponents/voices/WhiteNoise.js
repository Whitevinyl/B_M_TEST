var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// generic white noise voice

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function White() {
    this.gain = 0.5;
    this.panning = 0;
    this.amplitude = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

White.prototype.process = function(gain) {
    gain = utils.arg(gain,1);
    var white = (Math.random() * 2 - 1);
    return white * gain;
};

module.exports = White;