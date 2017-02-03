var utils = require('../../lib/utils');
var easing = require('../../lib/easing');

// An expandable envelope which takes an array of points, each point contains:

// 0: time  (in samples (point obj converts from ms))
// 1: gain  (0-1) (-1 sets it to sustain from previous point)
// 2: type  (easing - 'In','Out' or 'InOut')
// 3: curve ('linear','quadratic','cubic','quartic' or 'quintic')

//eg [{time:300,gain:0.5,type:'In',curve:'linear'},{time:100,gain:0.9,type:'Out'}]

// see also: EnvelopePoint & EnvelopeGenerator

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

function MultiEnvelope(t, d, env, curves) {
    var a = 0;
    var easeType = curves || 'quadratic';

    if (t<d) {


        // GET CURRENT STAGE //
        var stage = 0;
        var startTime = 0;
        var startGain = 0;

        // loop through envelope points and match against
        // time to find out where we are in the envelope

        var l = env.length;
        var totalTime = 0;
        for (var h = 0; h < l; h++) {
            var point = env[h];
            totalTime += point.time;
            if (t >= totalTime) {
                stage++;
                startTime += point.time;
                startGain = point.gain;
            }
        }


        // PROCESS STAGE IN ENVELOPE //
        if (env[stage]) {
            point = env[stage];

            // if sustaining, don't use a curve/ease //
            if (startGain === point.gain || point.gain === -1) {
                a = startGain;
            }
            else {
                if (point.curve) {
                    easeType = point.curve;
                }
                a = easing['' + easeType + point.type]((t - startTime), startGain, -(startGain - point.gain), point.time);
            }
        }
        else {
            a = 0;
        }


        // SAFETY //
        if (a!==a) a = 0;
    }

    return a;
}

module.exports = MultiEnvelope;
