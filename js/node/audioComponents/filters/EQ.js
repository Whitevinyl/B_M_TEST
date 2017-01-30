var Biquad = require('./Biquad');

// simple 3 x biquad filter parametric EQ

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------

function EQ() {
    this.low = new Biquad.mono();
    this.mid = new Biquad.mono();
    this.high = new Biquad.mono();
}
var proto = EQ.prototype;


//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(signal,f1,g1,f2,Q2,g2,f3,g3) {

    var filtered;
    filtered = this.low.process(signal,'lowshelf',f1,0,g1);
    filtered = this.mid.process(filtered,'peaking',f2,Q2,g2);
    filtered = this.high.process(filtered,'highshelf',f3,0,g3);

    return filtered;
};


//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------

function StereoEQ() {
    this.EQ1 = new EQ();
    this.EQ2 = new EQ();
}
proto = StereoEQ.prototype;


//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(signal,f1,g1,f2,Q2,g2,f3,g3) {
    return [
        this.EQ1.process(signal[0],f1,g1,f2,Q2,g2,f3,g3),
        this.EQ2.process(signal[1],f1,g1,f2,Q2,g2,f3,g3)
    ];
};


module.exports = {
    mono: EQ,
    stereo: StereoEQ
};
