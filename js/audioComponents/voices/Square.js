var utils = require('../../lib/utils');

// A simple square wave voice, with phase start offset (click)

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Square(phaseOffset) {
    phaseOffset = utils.arg(phaseOffset,0);
    phaseOffset = utils.valueInRange(phaseOffset,0,1);

    this.p = 2; // 2 = zero phase
    this.p -= phaseOffset;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

Square.prototype.process = function(frequency) {
    frequency = (frequency*2)/sampleRate;

    var a = this.p*(2-Math.abs(this.p));

    this.p += (frequency*2);
    if(this.p > 2) this.p -= 4;

    if (a>0) {
        return Math.ceil(a);
    }
    if (a<0) {
        return Math.floor(a);
    }
    else {
        return 0;
    }
};

module.exports = Square;
