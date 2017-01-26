
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
var FadeEnvelope = require('./FadeEnvelope');
var Interpolate = require('./Interpolate');
var Pan = require('./Pan');
var RampEnvelope = require('./RampEnvelope');
var Repeater = require('./Repeater');
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
    interpolate: Interpolate,
    rampEnvelope: RampEnvelope,
    range: ControlRange,
    pan: Pan,
    toMono: ToMono,
    toStereo: ToStereo,

    Repeater: Repeater
};