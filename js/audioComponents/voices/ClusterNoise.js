var utils = require('../../lib/utils');

// An adjustable noise algorithm with settings for low frequency movement (range1),
// high frequency movement (range2) and segmentation/distortion (rate).

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function ClusterNoise() {
    this.origin = 0;
    this.originCount = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

ClusterNoise.prototype.process = function(rate,range1,range2,gain) {
    rate = utils.arg(rate,3);
    range1 = utils.arg(range1,0.1);
    range2 = utils.arg(range2,0.2);
    gain = utils.arg(gain,1);

    // count to next randomisation //
    this.originCount--;
    if (this.originCount<1) {
        this.originCount = 1 + (Math.random()*(rate));
        this.origin += (Math.random()*(range1*2)) - range1;
    }

    // get our random sample //
    var r = this.origin + (Math.random()*(range2*2)) - range2;

    // stay in bounds //
    this.origin = utils.valueInRange(this.origin,-1,1);
    r = utils.valueInRange(r,-1,1);

    return r * gain;
};


module.exports = ClusterNoise;