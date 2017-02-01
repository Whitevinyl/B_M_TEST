
var feedback = require('./Feedback');

// Not a real reverb, a pretty hacky effect using feedback (if you can make a nice reverb
// like this let me know!)

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------

function reverb(level,predelay,size,reflections,channel,index) {
    var primes = [0, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101];
    var out = 0;
    var r = 1/(reflections*1.3);
    for (var j=0; j<reflections; j++) {
        out += feedback.mono(((level) - (r*j))*0.15,predelay + (primes[j]*size),channel,index);
    }
    return out;
}

//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------

function stereoReverb(signal,level,predelay,size,reflections,channel,index) {
    return [
        signal[0] += reverb(level,predelay,size,reflections,channel[1],index),
        signal[1] += reverb(level,predelay,size,reflections,channel[0],index)
    ];
}

module.exports = stereoReverb;
