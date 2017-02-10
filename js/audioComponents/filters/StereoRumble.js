var utils = require('../../lib/utils');
var WalkSmooth = require('../mods/WalkSmooth');

// A low frequency rumbling noise algorithm, using the 'WalkSmooth' controller as a wave.
// 300 - 800hz is good for subby rumbles, around 1200hz for like a distant jet engine
// and 6000hz becomes an aggressive roar/scream.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function StereoRumble() {
    this.r1 = new WalkSmooth();
    this.r2 = new WalkSmooth();
}


//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

StereoRumble.prototype.process = function(signal,frequency,ducking,gain) {
    frequency = utils.arg(frequency,500);
    ducking = utils.arg(ducking,0.5);
    gain = utils.arg(gain,0.5);

    return [
        (signal[0]*(1-(ducking * gain))) + (this.r1.process(frequency,10) * gain),
        (signal[1]*(1-(ducking * gain))) + (this.r2.process(frequency,10) * gain)
    ];
};

module.exports = StereoRumble;
