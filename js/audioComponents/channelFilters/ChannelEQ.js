var utils = require('../../lib/utils');
var common = require('../common/Common');
var EQ = require('../filters/EQ');

// Applying EQ to a complete channel pass rather than inline

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


function channelEQ(channel,f1,g1,f2,Q2,g2,f3,g3) {

    console.log("Shaping...");
    var i, l, signal;
    var stereoEQ = new EQ.stereo();

    // MAIN LOOP //
    l = channel[0].length;
    for (i=0; i<l; i++) {

        // get current sample //
        signal = [channel[0][i], channel[1][i]];

        // process sample //
        signal = stereoEQ.process(signal,f1,g1,f2,Q2,g2,f3,g3);

        // write sample //
        channel[0][i] = signal[0];
        channel[1][i] = signal[1];
    }
}

module.exports = channelEQ;