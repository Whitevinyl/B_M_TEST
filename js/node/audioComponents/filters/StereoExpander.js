var utils = require('../../lib/utils');
var common = require('../common/Common');

var Repeater = require('../common/Repeater');

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function StereoExpander() {
    this.memory = [];
}
var proto = StereoExpander.prototype;


//-------------------------------------------------------------------------------------------
//  PLAYER PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,delay) {

    // convert delay to samples //
    delay = audioClock.millisecondsToSamples(delay);

    // merge into mono //
    var mono = common.toMono(signal);

    // save memory of current sample for later //
    this.memory.push(mono);

    // trim memory and construct signal //
    if (this.memory.length>delay) {
        this.memory.shift();
        signal = [
            mono,
            mono + this.memory[0]
        ];
    }
    else {
        signal = [
            mono,
            0
        ];
    }

    return signal;
};


module.exports = StereoExpander;