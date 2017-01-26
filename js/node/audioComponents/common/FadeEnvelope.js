var utils = require('../../lib/utils');
var easing = require('../../lib/easing');

// A simple symmetrical envelope, for use with grains etc

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


function FadeEnvelope(i,duration,fade) {
    var a = 1;

    var fadeSize = Math.floor(duration * fade);
    if (i < fadeSize) {
        a = (i/fadeSize);
    }
    if (i > (duration - fadeSize)) {
        a = 1 - ((i -(duration - fadeSize))/fadeSize);
    }

    return a;
}

module.exports = FadeEnvelope;