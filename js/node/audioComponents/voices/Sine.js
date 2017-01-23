
var Tombola = require('tombola');
var tombola = new Tombola();

// A simple sine wave voice

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Sine() {
    this.p = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

Sine.prototype.process = function(frequency) {
    frequency = frequency/sampleRate;

    var a = this.p*(2-Math.abs(this.p));

    this.p += (frequency*2);
    if(this.p > 2) this.p -= 4;

    return a;
};

module.exports = Sine;