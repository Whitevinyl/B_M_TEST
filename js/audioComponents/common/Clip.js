var utils = require('../../lib/utils');

// A hard peak clip, only advisable to use on already noisy/distorted signals

//-------------------------------------------------------------------------------------------
//  MONO CLIP
//-------------------------------------------------------------------------------------------

function clip(signal,max) {
    if (signal > max) {
        signal = max;
    }
    if (signal < -max) {
        signal = -max;
    }
    return signal;
}


//-------------------------------------------------------------------------------------------
//  STEREO CLIP
//-------------------------------------------------------------------------------------------

function stereoClip(signal,max) {
    return [
        clip(signal[0],max),
        clip(signal[1],max)
    ];
}


module.exports = {
    mono: clip,
    stereo: stereoClip
};