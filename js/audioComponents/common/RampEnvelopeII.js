var easing = require('../../lib/easing');

// ramps a value between two time points

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

function RampEnvelopeII(t,d,from,to,start,end,ease) {
    var a = 0;

    if (t <= d) {
        start = audioClock.millisecondsToSamples(start);
        end = audioClock.millisecondsToSamples(end);

        if (t<start) {
            a = from;
        }
        if (t>end) {
            a = to;
        }

        if (t>=start && t<=end) {
            a = easing[''+ease+''](t-start,from,to-from,end-start);
        }

        if (a!==a) a = 0;
    }


    return a;
}

module.exports = RampEnvelopeII;
