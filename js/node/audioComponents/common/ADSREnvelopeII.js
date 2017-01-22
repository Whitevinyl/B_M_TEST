var utils = require('../../lib/utils');
var easing = require('../../lib/easing');

// A simple ADSR envelope, adsr should be an array w 4 index, a,d & r are milliseconds

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

function ADSREnvelopeII(t,d,adsr) {
    var a = 0;

    if (t<d) {
        var attack = audioClock.millisecondsToSamples(adsr[0]);
        var decay = audioClock.millisecondsToSamples(adsr[1]);
        var sustain = adsr[2];
        var release = audioClock.millisecondsToSamples(adsr[3]);

        if (t<=attack) {
            //a = ((1/attack) * t);
            a = easing.circleIn(t, 0, 1, attack);
        }
        if (t>attack && t<=(attack + decay)) {
            a = easing.circleOut(t - attack, 1, -(1-sustain), decay);
        }
        if (t>(attack + decay) && t<=(attack + decay + release)) {
            a = easing.circleOut(t - (attack + decay), sustain, -sustain, release);
        }
        if (t>(attack + decay + release)) {
            a = 0;
        }

        if (a!==a) a = 0;
    }

    return a;
}

module.exports = ADSREnvelopeII;
