
// Just using this to combine the requires of commonly used audio utility components
// among other components

//-------------------------------------------------------------------------------------------
//  IMPORTS
//-------------------------------------------------------------------------------------------

var Add = require('./Add');
var ADSREnvelope = require('./ADSREnvelope');
var ADSREnvelopeII = require('./ADSREnvelopeII');
var ArrayEnvelope = require('./ArrayEnvelope');
var ClapEnvelope = require('./ClapEnvelope');
var Combine = require('./Combine');
var ControlRange = require('./ControlRange');
var EnvelopeGenerator = require('./EnvelopeGenerator');
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


//-------------------------------------------------------------------------------------------
//  EXPORTS
//-------------------------------------------------------------------------------------------

module.exports = {

    // basic / conversion //
    add: Add,
    combine: Combine,
    interpolate: Interpolate,
    range: ControlRange,
    RMS: RMS,
    pan: Pan,
    peak: Peak,
    toMono: ToMono,
    toStereo: ToStereo,

    // individual envelopes //
    ADSREnvelope: ADSREnvelope,
    ADSREnvelopeII: ADSREnvelopeII,
    arrayEnvelope: ArrayEnvelope,
    clapEnvelope: ClapEnvelope,
    fadeEnvelope: FadeEnvelope,
    rampEnvelope: RampEnvelope,
    rampEnvelopeII: RampEnvelopeII,

    // multi-envelope system //
    getShape: EnvelopeGenerator.shape,
    addShape: EnvelopeGenerator.addShape,
    randomEnvelope: EnvelopeGenerator.randomEnvelope,
    EnvelopePoint: EnvelopePoint,
    multiEnvelope: MultiEnvelope,

    // other //
    Repeater: Repeater // should maybe be in filters?
};