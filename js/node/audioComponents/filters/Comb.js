
var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// Adapted from http://wavepot.com/opendsp/combfilter

//-------------------------------------------------------------------------------------------
//  MONO INIT
//-------------------------------------------------------------------------------------------

function Comb() {
    this.index = 0;
    this.buffer = [];
    this.filter = 0;
}

//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------

Comb.prototype.process = function(input,size,damp,feedback) {

    // zero as required //
    if (!this.buffer[this.index] && this.buffer[this.index]!== 0) {
        this.buffer.push(0);
    }

    var output = this.buffer[this.index];

    this.filter = output * (1 - damp) + this.filter * damp;
    this.buffer[this.index] = input * 0.015 + this.filter * feedback;

    this.index++;
    if (this.index === size) this.index = 0;

    return output;

};

//-------------------------------------------------------------------------------------------
//  STEREO INIT
//-------------------------------------------------------------------------------------------

function StereoComb() {
    this.comb1 = new Comb();
    this.comb2 = new Comb();
}

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

StereoComb.prototype.process = function(input,size,damp,feedback) {
    return [
        this.comb1.process(input[0],size,damp,feedback),
        this.comb2.process(input[1],size,damp,feedback)
    ];

};


module.exports = {
    mono: Comb,
    stereo: StereoComb
};