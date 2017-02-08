
var Sine = require('./Sine');
var Square = require('./Square');

// A multi-voice oscillator with blend between voices //

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function SineSquare(phaseOffset) {
    this.sine = new Sine(phaseOffset);
    this.square = new Square(phaseOffset);
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

SineSquare.prototype.process = function(frequency,blend) {
    blend *= 0.15;
    return (this.sine.process(frequency) * (1-blend)) + (this.square.process(frequency) * blend);
};

module.exports = SineSquare;
