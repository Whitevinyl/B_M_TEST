
var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var Perlin = require('../voices/Perlin');
var common = require('../common/Common');

// I just test component ideas here, whatever's here is the last thing I tested (& committed)

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Testing() {
    this.voice = new Perlin();
    this.delay = new common.Repeater();
    this.panner = new Perlin();
    this.panSpeed = tombola.rangeFloat(0.01,1);
    this.p = tombola.rangeFloat(-1,1);
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

Testing.prototype.process = function(input, frequency, mix) {

    // voice //
    var signal = this.voice.process(frequency) * 0.1;

    // stereo pan //
    this.p = this.panner.process(this.panSpeed);
    signal = common.toStereo(signal,this.p);

    signal = this.delay.process(signal,1000,0.4,true);

    return [
        (input[0] * (1-mix)) + (signal[0] * mix),
        (input[1] * (1-mix)) + (signal[1] * mix)
    ];
};


module.exports = Testing;