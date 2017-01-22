var utils = require('../../lib/utils');
var easing = require('../../lib/easing');

// A clap envelope with multiple decays, adsr should be an array w 4 index, a,d & r are percentages

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

function ClapEnvelope(t,d,adsr) {
    var a = 0;

    if (t<d) {
        var attack = audioClock.millisecondsToSamples(adsr[0]);
        var decay = audioClock.millisecondsToSamples(adsr[1]);
        var halfDecay = Math.round(decay/2);
        var sustain = adsr[2];
        var release = d - (attack + decay);

        if (t<=attack) {
            a = easing.circleIn(t, 0, 1, attack);
        }
        if (t>attack && t<=(attack + halfDecay)) {
            a = 1 - (((1-sustain)/halfDecay) * (t-attack));
        }
        if (t>(attack + halfDecay) && t<=(attack + decay)) {
            a = 1 - (((1-sustain)/halfDecay) * (t-(attack + halfDecay)));
        }
        if (t>(attack + decay)) {
            a = easing.circleOut(t - (attack + decay), 1, -1, release);
        }
        if (t>(attack + decay + release)) {
            a = 0;
        }

        if (a!==a) a = 0;
    }

    return a;
}

module.exports = ClapEnvelope;
