var utils = require('../../lib/utils');
var common = require('../common/Common');

// Simple peak compression, was trying to use lookahead & a follower but couldn't get it
// working well so it's just a rigid & inline limiter. Will distort if used too hard.

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


/*function PeakCompressor(channel,threshold,ratio) {

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
}*/

function PeakCompressor(channel,threshold,ratio) {

    // INIT //
    console.log('Compressing Peaks...');
    var meter = new common.peak.stereo();
    var follower = 0;

    threshold = threshold || 0.8;
    ratio = ratio || 3;

    var window  = 1;
    var lookAhead = 50;
    var coolDown = lookAhead;
    var attack  = 1/(lookAhead*2);
    var release = 0.0001;

    var i,l;
    var signal;
    var lookAheadSignal;
    var peak;
    var L, R;
    var diffL,diffR;




    // LOOK AHEAD //
    // we're just pre-populating the meter here //
    for (i=0; i<lookAhead; i++) {
        signal = [channel[0][i],channel[1][i]];
        peak = meter.process(signal,window);
    }


    // MAIN LOOP //
    // now we start the compressor //
    l = channel[0].length;
    for (i=0; i<l; i++) {

        // get current sample //
        signal = [channel[0][i], channel[1][i]];


        // get look-ahead sample //
        var lookAheadIndex = Math.min(i + lookAhead, l - 1);
        lookAheadSignal = [channel[0][lookAheadIndex], channel[1][lookAheadIndex]];


        // get peak from look ahead //
        peak = meter.process(lookAheadSignal,window);



        // if it's above the threshold, engage attack //
        if (peak > threshold) {
            follower += attack;
            coolDown = lookAhead;
        }
        // if below, engage release //
        else if (peak < threshold && coolDown <= 0) {
            follower -= release;
        }

        // decay the cooldown for our release //
        if (coolDown > 0) {
            coolDown--;
        }


        // keep our rms follower in the range 0 - 1 //
        follower = utils.valueInRange(follower,0,1);

        // Set gain based on follower & threshold //
        L = signal[0];
        R = signal[1];

        var overlapL = (Math.abs(L) - threshold);
        var overlapR = (Math.abs(R) - threshold);
        var rat = (ratio-1) * follower;
        if (follower > 0){
            /*if (L > threshold) {
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
            }*/

            /*L = (L/(1+rat));
            R = (R/(1+rat));*/
            diffL = L;
            diffR = R;

            if (L > threshold) {
                diffL = threshold + (overlapL/ratio );
            }
            if (L < -threshold) {
                diffL = -threshold - (overlapL/ratio );
            }
            if (R > threshold) {
                diffR = threshold + (overlapR/ratio );
            }
            if (R < -threshold) {
                diffR = -threshold - (overlapR/ratio );
            }

            L = L + ((L - diffL) * follower);
            R = R + ((R - diffR) * follower);

        }

        // write attenuated signal //
        channel[0][i] = L;
        channel[1][i] = R;
    }
}

module.exports = PeakCompressor;