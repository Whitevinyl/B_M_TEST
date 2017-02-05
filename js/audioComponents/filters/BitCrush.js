var utils = require('../../lib/utils');

// A sample holding bit crusher

//-------------------------------------------------------------------------------------------
//  MONO INIT
//-------------------------------------------------------------------------------------------

function BitCrush() {
    this.memory = 0;
    this.memoryA = 0;
    this.memoryB = 0;
    this.index = -2;
}

//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------

BitCrush.prototype.process = function(input,size,interpolate) {
    this.index++;
    if (this.index>=size || this.index<0) {
        this.memoryA = this.memory;
        this.memoryB = input;
        this.index = 0;
    }
    var out = this.memoryA;

    if (interpolate) {
        var diff = size - Math.floor(size);
        out = (this.memoryB * (1-diff)) + (this.memoryA * diff);
    }

    this.memory = input;

    return out;
};


//-------------------------------------------------------------------------------------------
//  STEREO INIT
//-------------------------------------------------------------------------------------------

function StereoBitCrush() {
    this.b1 = new BitCrush();
    this.b2 = new BitCrush();
}

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------


StereoBitCrush.prototype.process = function(signal,size,interpolate,mix) {
    return [
        (signal[0] * (1-mix)) + (this.b1.process(signal[0],size,interpolate) * mix),
        (signal[1] * (1-mix)) + (this.b2.process(signal[1],size,interpolate) * mix)
    ];
};


module.exports = {
    mono: BitCrush,
    stereo: StereoBitCrush
};