var utils = require('../../lib/utils');
var easing = require('../../lib/easing');

// ramps a value between two percentage points

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

function RampEnvelope(t,d,from,to,start,end,ease) {
    var a = 0;

    if (t <= d) {
        start = Math.round((d/100) * start);
        end = Math.round((d/100) * end);

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

module.exports = RampEnvelope;