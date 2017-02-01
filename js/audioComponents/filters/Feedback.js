var utils = require('../../lib/utils');

// Copies signal from previous samples and adds it to the current one

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------

function feedback(level,delay,channel,index,feedBack,feedSource) {
    feedBack = utils.arg(feedBack,0);
    delay = Math.round(delay);
    var fb = 0;
    if (feedSource) {
        fb = (feedSource[index-delay]*feedBack);
    }
    if (index<delay) {
        return 0;
    }
    return (channel[index-delay] + fb)*level;
}

//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------

function stereoFeedback(signal,level,delay,channel,index,feedBack,feedSource) {
    feedBack = utils.arg(feedBack,0);
    return [
        signal[0] + feedback(level,delay,channel[1],index,feedBack,feedSource[0]),
        signal[1] + feedback(level,delay,channel[0],index,feedBack,feedSource[1])
    ];
}

module.exports = {
    mono: feedback,
    stereo: stereoFeedback
};