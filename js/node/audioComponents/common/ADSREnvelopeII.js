var utils = require('../../lib/utils');
var easing = require('../../lib/easing');

// A simple ADSR envelope, adsr should be an array w 4 index, a,d & r are milliseconds

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

function ADSREnvelopeII(t, d, adsr, curves) {
    var a = 0;

    var easeType = curves || 'quadratic';

    if (t<d) {

        // GET VALUES //
        var attack = 1 + audioClock.millisecondsToSamples(adsr[0]);
        var decay = 1 + audioClock.millisecondsToSamples(adsr[1]);
        var sustain = adsr[2];
        var release = 1 + audioClock.millisecondsToSamples(adsr[3]);


        // WHERE ARE WE IN THE ENVELOPE //
        var stage = 1;
        var start = 0;

        if (t >= attack && t < (attack + decay)) {
            stage = 2;
            start = attack;
        }
        if (t >= (attack + decay) && t < (attack + decay + release)) {
            stage = 3;
            start = attack + decay;
        }
        if (t >= (attack + decay + release)) {
            stage = 4;
            start = attack + decay + release;
        }



        var log = {
            t: t,
            a: attack,
            d: decay,
            s: sustain,
            r: release,
            stage: stage
        };


        // PROCESS RELATIVE TO STAGE IN ENVELOPE //
        switch (stage) {

            case 1:
                a = easing[''+easeType+'In']((t - start), 0, 1, attack);
                break;

            case 2:
                a = easing[''+easeType+'Out']((t - start), 1, -(1-sustain), decay);
                break;

            case 3:
                //if (release<200) easeType = 'linear';
                a = easing[''+easeType+'Out']((t - start), sustain, -sustain, release);
                break;

            case 4:
                a = 0;
                break;

        }

    }


    return a;
}

module.exports = ADSREnvelopeII;
