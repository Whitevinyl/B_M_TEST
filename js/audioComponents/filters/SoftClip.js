
// from http://wavepot.com/opendsp/softclip

//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------


function softClip(x, amt){
    return x / ((amt || 1) + Math.abs(x));
}

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------


function stereoSoftClip(signal, drive){
    return [
        softClip(signal[0],drive),
        softClip(signal[1],drive)
    ];
}

module.exports = {
    mono: softClip,
    stereo: stereoSoftClip
};