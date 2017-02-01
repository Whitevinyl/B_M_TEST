
// Just using this to combine the requires of commonly used utility components among other
// components

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

var Add = require('./Add');
var ADSREnvelope = require('./ADSREnvelope');
var ADSREnvelopeII = require('./ADSREnvelopeII');
var ArrayEnvelope = require('./ArrayEnvelope');
var ClapEnvelope = require('./ClapEnvelope');
var Combine = require('./Combine');
var ControlRange = require('./ControlRange');
var EnvelopePoint = require('./EnvelopePoint');
var FadeEnvelope = require('./FadeEnvelope');
var Interpolate = require('./Interpolate');
var MultiEnvelope = require('./MultiEnvelope');
var Pan = require('./Pan');
var Peak = require('./Peak');
var RampEnvelope = require('./RampEnvelope');
var RampEnvelopeII = require('./RampEnvelopeII');
var Repeater = require('./Repeater');
var RMS = require('./RMS');
var ToMono = require('./ToMono');
var ToStereo = require('./ToStereo');




module.exports = {
    add: Add,
    ADSREnvelope: ADSREnvelope,
    ADSREnvelopeII: ADSREnvelopeII,
    arrayEnvelope: ArrayEnvelope,
    clapEnvelope: ClapEnvelope,
    combine: Combine,
    fadeEnvelope: FadeEnvelope,
    EnvelopePoint: EnvelopePoint,
    interpolate: Interpolate,
    multiEnvelope: MultiEnvelope,
    rampEnvelope: RampEnvelope,
    rampEnvelopeII: RampEnvelopeII,
    range: ControlRange,
    RMS: RMS,
    pan: Pan,
    peak: Peak,
    toMono: ToMono,
    toStereo: ToStereo,

    Repeater: Repeater
};