var Sine = require('./Sine');

// A rounded sine creating steps

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function StepSine() {
    this.sine = new Sine();
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

StepSine.prototype.process = function(frequency) {
    return Math.round(this.sine.process(frequency));
};

module.exports = StepSine;
