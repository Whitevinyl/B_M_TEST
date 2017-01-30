var Resonant = require('../filters/Resonant');


// simple 3 x filter EQ

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------


function EQ() {
    this.low = new Resonant.mono();
    this.mid = new Resonant.mono();
    this.high = new Resonant.mono();
}
var proto = EQ.prototype;

//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,frequency,q,gain) {


    var filtered = this.filter.process(frequency,q,signal,'BP');


    return (signal * (1 - (gain/2))) + (filtered * gain);
};


//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------


function StereoQ() {
    this.Q1 = new Q();
    this.Q2 = new Q();
}
proto = StereoQ.prototype;

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,frequency,q,gain) {
    return [
        this.Q1.process(signal[0],frequency,q,gain),
        this.Q2.process(signal[1],frequency,q,gain)
    ];
};


module.exports = {
    mono: Q,
    stereo: StereoQ
};
