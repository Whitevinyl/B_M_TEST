var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// A granular noise, based on random repetition of a short sine buffer
// WARNING - not advisable for use currently, it unbalances the waveform, cancelling sounds.

// length:    buffer length
// frequency: sine frequency

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------


function Hiss() {
    this.memory = [];
    this.index = 0;
    this.t = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


Hiss.prototype.process = function(length,frequency,gain) {
    length = utils.arg(length,16);
    frequency = utils.arg(frequency,9000);
    gain = utils.arg(gain,0.5);

    // populate buffer where needed //
    var l = this.memory.length;
    if (l<length) {
        this.t += 1/sampleRate;
        this.memory.push( Math.sin(frequency * this.t * utils.TAU) );
    }


    // set output sample //
    var out = this.memory[this.index];


    // increment / loop index //
    this.index++;
    if (this.index === (length-1)) {
        this.index = tombola.range(0,length-1);
    }

    return out * gain;
};



module.exports = Hiss;