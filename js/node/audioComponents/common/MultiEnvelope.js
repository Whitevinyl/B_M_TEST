var utils = require('../../lib/utils');
var easing = require('../../lib/easing');

// An expandable envelope which takes an array of points, each point contains:
// 0: time (in samples (point obj converts from ms))
// 1: gain (0-1)
// 2: type (curve - 'In','Out' or 'InOut')

//eg [{time:300,gain:0.5,type:'In'},{time:100,gain:0.9,type:'Out'}]

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

        var l = env.length;
        for (var h = 0; h < l; h++) {
            var point = env[h];
            if (t >= ((point.time + startTime))) {
                stage++;
                startTime += point.time;
                startGain = point.gain;
            }
        }

        var envLog = {
            t: t,
            stage: stage,
            startTime: startTime,
            startGain: startGain
        };

        //console.log(envLog);


        // PROCESS STAGE IN ENVELOPE //
        if (env[stage]) {
            point = env[stage];

            if (startGain === point.gain) {
                a = startGain;
            }
            else {
                a = easing['' + easeType + point.type]((t - startTime), startGain, -(startGain - point.gain), point.time);
            }
        }
        else {
            a = 0;
        }



        // SAFETY //
        if (a!==a) {
            a = 0;
        }
    }


    return a;
}

module.exports = MultiEnvelope;
