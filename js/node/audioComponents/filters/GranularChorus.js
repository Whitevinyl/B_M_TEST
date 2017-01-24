var utils = require('../../lib/utils');
var common = require('../common/Common');

var Repeater = require('../common/Repeater');

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function GranularChorus() {
    this.memory = [];
    this.playHead = 0;
}
var proto = GranularChorus.prototype;


//-------------------------------------------------------------------------------------------
//  PLAYER PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,bufferLength,effect,mix) {

    // record to sample buffer for later //
    this.memory.push(signal);

    // we have enough buffer - let's go //
    if (this.memory.length>bufferLength) {

        // trim memory buffer length //
        this.memory.shift();

        // normalise effect value //
        var speed = 1 + (effect*0.1);
        speed = utils.valueInRange(speed,0.1,5);

        // update playhead //
        this.playHead -= speed;
        if (this.playHead<0) {
            this.playHead = this.memory.length - 1;
        }

        // get sample //
        var sample = common.interpolate(this.memory,this.playHead);

        // mix //
        signal = [
            (signal[0] * (1-mix)) + (sample[0]*mix),
            (signal[1] * (1-mix)) + (sample[1]*mix)
        ];
    }

    return signal;
};


module.exports = GranularChorus;
