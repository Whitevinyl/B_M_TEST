var utils = require('../../lib/utils');
var common = require('../common/Common');

// ugly basic compressor, for use after normalisation //

//-------------------------------------------------------------------------------------------
//  COMPRESSOR
//-------------------------------------------------------------------------------------------


function Compressor(signal,threshold,squeeze) {
    var dif = 0;
    if (signal > threshold) {
        dif = signal - threshold;
        signal = threshold + (dif * squeeze);
    }
    if (signal < -threshold) {
        dif = signal + threshold;
        signal = -threshold + (dif * squeeze);
    }
    var makeup = 1-squeeze;
    return (signal * (1+makeup));
}

function StereoCompressor(signal,threshold,squeeze) {

    return [
        Compressor(signal[0],threshold,squeeze),
        Compressor(signal[1],threshold,squeeze)
    ];

}


module.exports = StereoCompressor;
