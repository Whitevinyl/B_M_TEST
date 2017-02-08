
var Sine = require('./Sine');
var Triangle = require('./Triangle');

// A multi-voice oscillator with blend between voices //

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function SineTriangle(phaseOffset) {
    this.sine = new Sine(phaseOffset);
    this.triangle = new Triangle(phaseOffset);
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

SineTriangle.prototype.process = function(frequency,blend) {
    return (this.sine.process(frequency) * (1-blend)) + (-this.triangle.process(frequency) * blend);
};

module.exports = SineTriangle;
