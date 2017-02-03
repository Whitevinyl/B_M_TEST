var utils = require('../../lib/utils');

// Point object, for use in MultiEnvelopes

// time: in milliseconds (converts to samples) to reach gain
// gain: 0 - 1 / -1 sets a sustain of the previous point's gain
// type: is the curve style, choose 'In', 'Out' or 'InOut'
// curve: is the curve algorithm, choose 'linear','quadratic','cubic','quartic' or 'quintic'

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function EnvelopePoint(time, gain, type, curve) {
    time  = utils.arg(time, 10);
    gain  = utils.arg(gain, 1);
    type  = utils.arg(type, 'Out');
    curve = utils.arg(curve, null);

    this.time = audioClock.millisecondsToSamples(time);
    this.gain = gain;
    this.type = type;
    this.curve = curve;
}

//-------------------------------------------------------------------------------------------
//  PARAMS
//-------------------------------------------------------------------------------------------

EnvelopePoint.prototype.setTime = function(time) {
    this.time = audioClock.millisecondsToSamples(time);
};

EnvelopePoint.prototype.setGain = function(gain) {
    this.gain = gain;
};



module.exports = EnvelopePoint;