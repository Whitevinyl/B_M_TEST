
var Sine = require('./Sine');
var Square = require('./Square');

// A multi-voice oscillator with blend between voices //

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function SineSquare() {
    this.sine = new Sine();
    this.square = new Square();
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

SineSquare.prototype.process = function(frequency,blend) {
    return (this.sine.process(frequency) * (1-blend)) + (this.square.process(frequency) * blend);
};

module.exports = SineSquare;
