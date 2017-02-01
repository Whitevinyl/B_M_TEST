var utils = require('../../lib/utils');
var common = require('../common/Common');

// ugly basic compressor, for use after normalisation //

//-------------------------------------------------------------------------------------------
//  COMPRESSOR
//-------------------------------------------------------------------------------------------


function Compressor(signal,threshold,squeeze,max,mode) {

    if (mode === "compressor") {

        var dif = 0;
        var range = (1-threshold);

        // over positive threshold //
        if (signal > threshold) {
            dif = signal - threshold;
            signal = threshold + (dif * (squeeze * (dif/range)));
        }

        // over negative threshold //
        if (signal < -threshold) {
            dif = -signal - threshold;
            signal = -threshold - (dif * (squeeze * (dif/range)));
        }

        // makeup gain //
        var level = threshold + (range * squeeze);
        signal *= (level / (level*level));

    }

    // limit //
    signal *= max;
    return signal;
}

function StereoCompressor(signal,threshold,squeeze,max,mode) {

    return [
        Compressor(signal[0],threshold,squeeze,max,mode),
        Compressor(signal[1],threshold,squeeze,max,mode)
    ];

}


module.exports = StereoCompressor;
