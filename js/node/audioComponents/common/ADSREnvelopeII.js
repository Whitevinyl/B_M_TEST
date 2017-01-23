var utils = require('../../lib/utils');
var easing = require('../../lib/easing');

// A simple ADSR envelope, adsr should be an array w 4 index, a,d & r are milliseconds

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

function ADSREnvelopeII(t,d,adsr) {
    var a = 0;

    if (t<d) {
        var attack = 1 + audioClock.millisecondsToSamples(adsr[0]);
        var decay = 1 + audioClock.millisecondsToSamples(adsr[1]);
        var sustain = adsr[2];
        var release = 1 + audioClock.millisecondsToSamples(adsr[3]);

        var stage = 1;
        var start = 0;

        if (t >= attack) {
            stage +=1;
            start += attack;
        }
        if (t >= (decay + start)) {
            stage +=1;
            start += decay;
        }
        if (t >= (release + start)) {
            stage +=1;
            start += release;
        }

        var easeType = 'linear';

        var log = {
            t: t,
            a: attack,
            d: decay,
            s: sustain,
            r: release,
            stage: stage
        };


        switch (stage) {

            case 1:
                a = easing[''+easeType+'In']((t - start), 0, 1, attack);
                break;

            case 2:
                a = easing[''+easeType+'Out']((t - start), 1, -(1-sustain), decay);
                break;

            case 3:
                a = easing[''+easeType+'Out']((t - start), sustain, -sustain, release);
                if ((t-start)===0) console.log(log);
                break;

            case 4:
                a = 0;
                break;


        }




        /*if (t<=attack) {
            //a = ((1/attack) * t);
            a = easing.circleIn(t, 0, 1, attack);
        }
        if (t>=attack && t<=(attack + decay)) {
            a = easing.circleOut(t - attack, 1, -(1-sustain), decay);
            a = 1;
        }

        if (t>=(attack + decay) && t<=(attack + decay + release)) {
            a = easing.circleOut(t - (attack + decay), sustain, -sustain, release);
            a = 1;
        }
        if (t>(attack + decay + release)) {
            a = 0;
        }*/



        if (t>attack && t<(attack + decay + release) && a===0) {
            console.log(log);
        }

        if (a!==a) {
            a = 0;
            console.log(log);
        }
    }

    return a;
}

module.exports = ADSREnvelopeII;
