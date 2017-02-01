
var utils = require('../../lib/utils');

// Distortion effect which folds waveform peaks back on themselves beyond a given threshold.

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------

function foldBackII(input,threshold, power) {
    if (input>threshold) {
        input = threshold - ((input-threshold)*power);
    }
    if (input<-threshold) {
        input = -threshold - ((input-(-threshold))*power);
    }
    return utils.valueInRange(input,-threshold,threshold);
}


//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------


function stereoFoldBackII(signal,threshold,power,mix) {
    mix = utils.arg(mix,1);
    return [
        (signal[0] * (1-mix)) + (foldBackII(signal[0],threshold,power) * mix),
        (signal[1] * (1-mix)) + (foldBackII(signal[1],threshold,power) * mix)
    ];
}

module.exports = stereoFoldBackII;