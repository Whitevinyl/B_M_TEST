var utils = require('../../lib/utils');
var common = require('../common/Common');

// Unlike the other filters, this accepts a stereo channel instead of a signal. It performs a
// loop through the whole channel, looking ahead to analyse RMS effectively.

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


function PeakCompressor(channel,threshold,ratio) {

    // INIT //
    console.log('Compressing Peaks...');
    this.meter = new common.peak.stereo();
    this.follower = 0;

    threshold = threshold || 0.8;
    ratio = ratio || 3;

    var window  = 1800; // window supports low frequencies
    var attack  = 0.01;
    var release = 0.00001;

    var i,l;
    var signal;
    var lookAheadSignal;
    var peak, peakL, peakR;
    var gainL, gainR;
    var lookAhead;

    var peakMax = 0;


    // LOOK AHEAD //
    // we're just pre-populating the RMS meter here //
    lookAhead = Math.floor(window*0.4);
    for (i=0; i<lookAhead; i++) {
        signal = [channel[0][i],channel[1][i]];
        peak = this.meter.process(signal,window);
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


        // get rms from look ahead //
        peak = this.meter.process(lookAheadSignal,window);


        // get max peak //
        if (peak > peakMax) {
            peakMax = peak;
        }


        // if it's above the threshold, engage attack //
        if (peak > (threshold)) {
            this.follower += attack;
        }
        // if below, engage release //
        else {
            this.follower -= release;
        }


        // keep our rms follower in the range 0 - 1 //
        this.follower = utils.valueInRange(this.follower,0,1);

        // Set gain based on follower & threshold //
        gainL = 1;
        gainR = 1;

        var overlapL = (Math.abs(signal[0]) - threshold);
        var overlapR = (Math.abs(signal[1]) - threshold);
        var rat = (ratio-1);
        if (this.follower > 0){
            gainL = threshold + (overlapL/(1 + (rat* this.follower)) );
            gainR = threshold + (overlapR/(1 + (rat* this.follower)) )
        }

        // write attenuated signal //
        channel[0][i] = (signal[0] * gainL);
        channel[1][i] = (signal[1] * gainR);
    }
}

module.exports = PeakCompressor;