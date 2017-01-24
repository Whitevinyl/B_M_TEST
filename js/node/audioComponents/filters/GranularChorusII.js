var utils = require('../../lib/utils');
var common = require('../common/Common');
var Sine = require('../voices/Sine');
var Repeater = require('../common/Repeater');

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function GranularChorusII() {
    this.memory = [[],[]];
    this.playHead = 1;
    this.osc = new Sine();
}
var proto = GranularChorusII.prototype;


//-------------------------------------------------------------------------------------------
//  PLAYER PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,size,rate,mix) {
    //effect = utils.valueInRange(effect,0,50);

    // record to sample buffer for later //
    this.memory[0].push(signal[0]);
    this.memory[1].push(signal[1]);

    // we have enough buffer - let's go //
    var bufferLength = sampleRate;
    var scale = Math.round(size*2);
    if (this.memory[0].length>scale) {

        // trim memory buffer length //
        while (this.memory[0].length > bufferLength) {
            this.memory[0].shift();
            this.memory[1].shift();
        }

        // update playHead //
        var origin = this.memory[0].length - 1 - size;
        this.playHead = origin + (this.osc.process(rate) * size);

        // get sample //
        var sample = common.interpolate(this.memory,this.playHead);

        // mix //
        signal = [
            (signal[0] * (1-mix)) + (sample[1]*mix),
            (signal[1] * (1-mix)) + (sample[0]*mix)
        ];
    }

    return signal;
};


module.exports = GranularChorusII;

