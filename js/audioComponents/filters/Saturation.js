var utils = require('../../lib/utils');

// Distortion effect, adds a nice color, adapted from Bram de Jong's Soft Saturation:
// http://www.musicdsp.org/archive.php?classid=4#42

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------

function saturation(input,threshold) {
    var out = input;

    if (input>threshold) {
        out = threshold + (input-threshold)/(1+((input-threshold)/(1-threshold))^2);
    }
    if (input<-threshold) {
        out = -(threshold + (Math.abs(input)-threshold)/(1+((Math.abs(input)-threshold)/(1-threshold))^2));
    }

    if (input>1) {
        out = (threshold+1)/2;
    }
    if (input<-1) {
        out = (-threshold-1)/2;
    }

    // makeup gain //
    out *= (1/((threshold+1)/2));

    return out;
}

//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------

function stereoSaturation(signal,threshold,mix) {
    mix = utils.arg(mix,1);
    return [
        (signal[0] * (1 - mix)) + (saturation(signal[0],threshold) * mix),
        (signal[1] * (1 - mix)) + (saturation(signal[1],threshold) * mix)
    ];
}

module.exports = stereoSaturation;