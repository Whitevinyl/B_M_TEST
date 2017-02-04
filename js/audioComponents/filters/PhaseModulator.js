var utils = require('../../lib/utils');

// Modulate phase of an osc for metallic & growling sounds. Adapted from:
// http://wavepot.com/stai12/PhaseModulator

//-------------------------------------------------------------------------------------------
//  MONO INIT
//-------------------------------------------------------------------------------------------

function PhaseModulator() {

    // zero an array //
    this.buffer = [];
    for(var i = 0; i < sampleRate; ++i) {
        this.buffer.push(0);
    }
    this.index = 0;
}
var proto = PhaseModulator.prototype;

//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(voice, modulator, power, gain) {
    modulator = utils.arg(modulator,0);
    power = utils.arg(power,0.5);
    gain = utils.arg(gain,0.5);

    power = Math.ceil(power*sampleRate);

    // populate buffer as we go //
    this.buffer.push(voice);

    // get sample from buffer, with offset phase //
    var out = this.buffer[(this.index+Math.ceil((modulator*(power-1)+power)/2))%power];
    this.index = (this.index+1)%power;
    return out * gain;
};


module.exports = PhaseModulator;