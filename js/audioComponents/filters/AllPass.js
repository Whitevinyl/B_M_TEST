
var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// Adapted from http://wavepot.com/opendsp/allpass

//-------------------------------------------------------------------------------------------
//  MONO INIT
//-------------------------------------------------------------------------------------------

function AllPass() {
    this.index = 0;
    this.buffer = [];
}

//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------

AllPass.prototype.process = function(input,size) {

    // zero as required //
    if (!this.buffer[this.index] && this.buffer[this.index]!== 0) {
        this.buffer.push(0);
    }

    var sample = this.buffer[this.index];
    var output = -input + sample;
    this.buffer[this.index] = input + (sample * 0.5);

    this.index++;
    if (this.index >= size) this.index = 0;

    return output;
};

//-------------------------------------------------------------------------------------------
//  STEREO INIT
//-------------------------------------------------------------------------------------------

function StereoAllPass() {
    this.ap1 = new AllPass();
    this.ap2 = new AllPass();
}

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

StereoAllPass.prototype.process = function(input,size,mix) {
    return [
        (1 + (0.6 * mix)) * ( (input[0] * (1-mix)) + (this.ap1.process(input[0],size) * mix) ),
        (1 + (0.6 * mix)) * ( (input[1] * (1-mix)) + (this.ap2.process(input[1],size) * mix) )
    ];
};


module.exports = {
    mono: AllPass,
    stereo: StereoAllPass
};
