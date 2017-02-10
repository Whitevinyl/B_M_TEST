
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
var Clip = require('./Clip');
var Combine = require('./Combine');
var ControlRange = require('./ControlRange');
var EnvelopeGenerator = require('./EnvelopeGenerator');
var EnvelopePoint = require('./EnvelopePoint');
var FadeEnvelope = require('./FadeEnvelope');
var Inharmonic = require('./Inharmonic');
var Interpolate = require('./Interpolate');
var MultiEnvelope = require('./MultiEnvelope');
var Multiply = require('./Multiply');
var Pan = require('./Pan');
var Peak = require('./Peak');
var RampEnvelope = require('./RampEnvelope');
var RampEnvelopeII = require('./RampEnvelopeII');
var Repeater = require('./Repeater');
var RMS = require('./RMS');
var SumEnvelopes = require('./SumEnvelopes');
var ToMono = require('./ToMono');
var ToStereo = require('./ToStereo');


//-------------------------------------------------------------------------------------------
//  EXPORTS
//-------------------------------------------------------------------------------------------

module.exports = {

    // basic / conversion //
    add: Add,
    clipMono: Clip.mono,
    clipStereo: Clip.stereo,
    combine: Combine,
    interpolate: Interpolate,
    multiply: Multiply,
    pan: Pan,
    peak: Peak,
    range: ControlRange,
    RMS: RMS,
    sumEnvelopes: SumEnvelopes,
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
    Repeater: Repeater, // should maybe be in filters?
    Inharmonic: Inharmonic
};