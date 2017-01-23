var Resonant = require('../filters/Resonant');


// simple filter node with gain

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------


function Q() {
    this.filter = new Resonant.mono();
}
var proto = Q.prototype;

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