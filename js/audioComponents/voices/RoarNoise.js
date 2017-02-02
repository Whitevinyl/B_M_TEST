var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// A hard sounding noise algorithm

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Roar(threshold) {
    this.gain = 0.2;
    this.panning = 0;
    this.memory = 0;
    this.threshold = threshold || 0.8;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

Roar.prototype.process = function(threshold,gain) {
    if (threshold) {
        this.threshold = threshold; // get rid of this eventually, make like other noise algs
    }
    if (gain) {
        this.gain = gain; // ditto
    }
    var white = (Math.random() * 2) - 1;
    if (white>(-this.threshold) && white<this.threshold) {
        white = this.memory;
    }
    this.memory = white;
    return white * this.gain;
};

module.exports = Roar;