var utils = require('../../lib/utils');
var WalkSmooth = require('../mods/WalkSmooth');

// A low frequency rumbling noise algorithm, using the 'WalkSmooth' controller as a wave.
// 300 - 800hz is good for subby rumbles, around 1200hz for like a distant jet engine
// and 6000hz becomes an aggressive roar/scream.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Rumble() {
    this.rumble = new WalkSmooth();
}


//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

Rumble.prototype.process = function(signal,frequency,ducking,gain) {
    frequency = utils.arg(frequency,500);
    ducking = utils.arg(ducking,0.5);
    gain = utils.arg(gain,0.5);

    var r = this.rumble.process(frequency,10);
    return [
        (signal[0]*(1-ducking)) + (r * gain),
        (signal[1]*(1-ducking)) + (r * gain)
    ];
};

module.exports = Rumble;