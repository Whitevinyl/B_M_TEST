
// set the width of a stereo signal

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

function StereoWidth(signal,width) {

    // calc coefs //
    var tmp = 1/Math.max(1 + width,2);
    var coef_M = tmp;
    var coef_S = width * tmp;


    var m = (signal[0] + signal[1])*coef_M;
    var s = (signal[1] - signal[0])*coef_S;


    return [
        m - s,
        m + s
    ];
}

module.exports = StereoWidth;