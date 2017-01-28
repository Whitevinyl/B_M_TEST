var utils = require('../../lib/utils');
var common = require('../common/Common');

// basic volume boost, for use after normalisation //

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Volumizer() {
    this.meter = new common.RMS.stereo();
    this.volume = 0;
}
var proto = Volumizer.prototype;


//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,level) {

    level = level || 0;
    var window = 1500;
    var release = 0.3;
    var rms = this.meter.process(signal,window);

    this.volume = Math.max(rms, this.volume*release);

    var reduction = this.volume * level;
    var newLevel = 1 - level;
    var makeup = newLevel/(newLevel*newLevel);

    return [
        (signal[0] * makeup) - (signal[0] * reduction),
        (signal[1] * makeup) - (signal[1] * reduction)
    ];
};


module.exports = Volumizer;