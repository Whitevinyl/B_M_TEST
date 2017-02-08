
// A random sine sample with rate

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function SampleHold() {
    var f = (Math.PI * Math.PI) * 999999;
    this.frequency = (f*4)/sampleRate;
    this.s = 2;
    this.memory = 0;
    this.rateCounter = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

SampleHold.prototype.process = function(rate) {

    // oscillator //
    var a = this.s*(2-Math.abs(this.s));
    this.s += (this.frequency*2);
    if(this.s > 2) this.s -= 4;

    // rate counter //
    this.rateCounter--;
    if (this.rateCounter < 1) {
        this.memory = a;
        this.rateCounter = sampleRate/rate;
    }

    return this.memory;
};

module.exports = SampleHold;
