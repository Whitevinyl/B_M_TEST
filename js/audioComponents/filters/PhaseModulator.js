var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// Modulate phase of an osc for metallic & growling sounds. Adapted from:
// http://wavepot.com/stai12/PhaseModulator

//-------------------------------------------------------------------------------------------
//  MONO INIT
//-------------------------------------------------------------------------------------------

function PhaseModulator() {
    // populate buffer //
    this.buffer = new Array(Math.floor(0.01 * sampleRate));
    for(var i = 0; i < this.buffer.length; ++i)
        this.buffer[i] = 0.0;
    this.index = 0;
}
var proto = PhaseModulator.prototype;

//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(voice, modulator, strength, gain) {

    this.setStrength(strength);

    this.buffer[this.index] = voice;
    // when modulator = 1, out = newest value in buffer
    // when modulator = -1, out = oldest value in buffer
    var out = this.buffer[(this.index+Math.ceil((modulator*(this.buffer.length-1)+this.buffer.length)/2))%this.buffer.length];
    this.index = (this.index+1)%this.buffer.length;
    return out * gain;
};


proto.setStrength = function(strength) {

    var newLength = Math.floor((strength/100) * sampleRate);
    var l = this.buffer.length;

    //trim buffer //
    if (newLength < l) {
        this.buffer = this.buffer.slice(0,newLength);
    }

    // add to buffer //
    if (newLength > l) {
        for(var i = (l-1); i < newLength; ++i) {
            this.buffer.push(0);
        }
    }

    // move position //
    if ((newLength-1) < this.index) {
        this.index = 0;
    }
};


module.exports = PhaseModulator;