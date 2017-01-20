var feedback = require('./Feedback');
var lowPass = require('./LowPass');

// Not a real reverb, a pretty hacky effect using feedback (if you can make a nice reverb
// like this let me know!)

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------

function ReverbII() {
    this.filter = new lowPass.mono();
    this.primes = [0, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101];
}

ReverbII.prototype.process = function(signal,level,predelay,size,channel,index) {
    var reflections = Math.round(size/35);
    if (reflections>26) reflections = 26;

    var r = 1/(reflections*1.3);
    var cutoff = 16000;
    var cut = 1/(reflections*0.08);
    for (var j=0; j<reflections; j++) {
        var reverb = feedback.mono(((level) - (r*j))*0.15,predelay + (this.primes[j]*size),channel,index);
        //cutoff *= 0.97;
        reverb = this.filter.process(cutoff - (cut*j),0.5,reverb);
        signal += reverb;
    }
    return signal;
};

//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------

function StereoReverbII() {
    this.r1 = new ReverbII();
    this.r2 = new ReverbII();
}

StereoReverbII.prototype.process = function(signal,level,predelay,size,channel,index) {
    return [
        this.r1.process(signal[0],level,predelay,size,channel[1],index),
        this.r2.process(signal[1],level,predelay,size,channel[0],index)
    ];
};


module.exports = {
    mono: ReverbII,
    stereo: StereoReverbII
};