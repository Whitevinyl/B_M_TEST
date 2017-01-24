
// A simple square wave voice

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Square() {
    this.p = 2;
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
