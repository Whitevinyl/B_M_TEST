
var Sine = require('./Sine');
var Triangle = require('./Triangle');

// A multi-voice oscillator with blend between voices //

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function SineTriangle() {
    this.sine = new Sine();
    this.triangle = new Triangle();
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

SineTriangle.prototype.process = function(frequency,blend) {
    return (this.sine.process(frequency) * (1-blend)) + (this.triangle.process(frequency) * blend);
};

module.exports = SineTriangle;
