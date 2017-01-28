var utils = require('../../lib/utils');
var common = require('../common/Common');

// basic volume boost, for use after normalisation //

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function CompressorII() {
    this.meter = new common.RMS.stereo();
    this.volume = 0;
    this.follower = 0;
}
var proto = CompressorII.prototype;


//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,threshold) {

    threshold = threshold || 0.8;

    var window  = 512;
    var attack  = 0.001;
    var release = 0.0001;
    var ratio   = 3;
    var makeup  = 1.1;


    // get root mean square average volume //
    var rms = this.meter.process(signal,window);


    // if it's above the threshold, engage attack //
    if (rms > threshold) {
        this.follower += attack;
    }

    // if below, engage release //
    else {
        this.follower -= release;
    }

    // keep our rms follower in the range 0 - 1 //
    this.follower = utils.valueInRange(this.follower,0,1);


    // Set gain based on follower & threshold //
    var gain = 1;
    if (this.follower > 0){
        gain = threshold + ((rms - threshold)/(1 + (ratio-1)));
    }


    // return attenuated signal, boosted by makeup //
    return [
        (signal[0] * gain) * makeup,
        (signal[1] * gain) * makeup
    ];
};


module.exports = CompressorII;
