var utils = require('../../lib/utils');

// Waveshaping distortion effect:
// http://www.musicdsp.org/showArchiveComment.php?ArchiveID=46

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------


function waveShaper(input,amount,curve) {
    var out = input;
    var k = 2*amount/(1-amount);

    out = (1+k)*out/(1+k*Math.abs(out));

    return out;
}


//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------

function stereoWaveShaper(signal,threshold,curve,mix) {
    mix = utils.arg(mix,1);
    return [
        (signal[0] * (1 - mix)) + (waveShaper(signal[0],threshold,curve) * mix),
        (signal[1] * (1 - mix)) + (waveShaper(signal[1],threshold,curve) * mix)
    ];
}


module.exports = waveShaper;