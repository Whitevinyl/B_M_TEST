var utils = require('../../lib/utils');
var common = require('../common/Common');

// Simple peak compression, was trying to use lookahead & a follower but couldn't get it
// working well so it's just a rigid & inline limiter. Will distort if used too hard.

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


function PeakCompressor(channel,threshold,ratio) {

    // INIT //
    console.log('Compressing Peaks...');

    threshold = threshold || 0.7;
    ratio = ratio || 2;


    var i,l;
    var signal;
    var peak;
    var peakMax = 0;



    // MAIN LOOP //
    l = channel[0].length;
    for (i=0; i<l; i++) {

        // get current sample //
        signal = [channel[0][i], channel[1][i]];


        // measure each channel's overlap of the threshold //
        var L = signal[0];
        var R = signal[1];
        var overlapL = (Math.abs(signal[0]) - threshold);
        var overlapR = (Math.abs(signal[1]) - threshold);
        var rat = (ratio-1);


        // set channel levels //
        if (L > threshold) {
            L = threshold + (overlapL/(1 + rat) );
        }
        if (L < -threshold) {
            L = -threshold - (overlapL/(1 + rat) );
        }
        if (R > threshold) {
            R = threshold + (overlapR/(1 + rat) );
        }
        if (R < -threshold) {
            R = -threshold - (overlapR/(1 + rat) );
        }


        // write attenuated signal //
        channel[0][i] = L;
        channel[1][i] = R;


        // read max peak coming out of the compressor //
        var p = Math.max(Math.abs(L),Math.abs(R));
        if (p > peakMax) {
            peakMax = p;
        }
    }

    // log max peak output //
    //console.log('max peak: '+peakMax);
}

module.exports = PeakCompressor;