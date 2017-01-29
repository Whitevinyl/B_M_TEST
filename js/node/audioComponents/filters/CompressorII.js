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


proto.process = function(signal,threshold,ratio,makeUpGain) {

    threshold = threshold || 0.8;
    makeUpGain = makeUpGain || 0.1;
    ratio = ratio || 3;

    var window  = 500;
    var attack  = 0.00001;
    var release = 0.00001; //0.000008
    var makeup  = 1 + makeUpGain;


    // get root mean square average volume //
    var rms = this.meter.process(signal,window);


    // if it's above the threshold, engage attack //
    if (rms > (threshold*0.75)) {
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
    var overlap = (rms - threshold);
    var rat = 1 + (ratio-1);
    if (this.follower > 0){
        gain = threshold + (overlap/rat);
    }


    // return attenuated signal, boosted by makeup //
    return [
        (signal[0] * gain) * makeup,
        (signal[1] * gain) * makeup
    ];
};


module.exports = CompressorII;
