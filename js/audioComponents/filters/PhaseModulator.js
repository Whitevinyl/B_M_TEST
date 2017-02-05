var utils = require('../../lib/utils');
var common = require('../common/Common');

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
    this.buffer[this.index] = voice;

    // get sample from buffer, with offset phase //
    var ind = (this.index+((modulator*(power-1)+power)/2))%power;
    //var out = this.buffer[(this.index+Math.ceil((modulator*(power-1)+power)/2))%power];
    var out = common.interpolate(this.buffer,ind);
    this.index = (this.index+1)%power;
    return out * gain;
};


//-------------------------------------------------------------------------------------------
//  STEREO INIT
//-------------------------------------------------------------------------------------------

function StereoPhaseModulator() {
    this.pm1 = new PhaseModulator();
    this.pm2 = new PhaseModulator();
}
proto = StereoPhaseModulator.prototype;

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(signal,modulator,power,mix) {
    return [
        (signal[0] * (1 - mix)) + (this.pm1.process(signal[0],modulator,power,1) * mix),
        (signal[1] * (1 - mix)) + (this.pm2.process(signal[1],modulator,power,1) * mix)
    ];
};


module.exports = {
    mono: PhaseModulator,
    stereo: StereoPhaseModulator
};