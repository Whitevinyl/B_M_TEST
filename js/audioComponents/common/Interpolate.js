
// Linear interpolation for playing samples at speeds other than sampleRate

//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------

function Interpolate(buffer,i) {

    // get indices //
    var baseIndex = Math.floor(i);
    var diff = i - baseIndex;


    // allow for zeroed samples if a sample index doesn't exist //
    var a = 0;
    var b = 0;
    if (buffer[baseIndex]) {
        a = buffer[baseIndex];
    }
    if (buffer[baseIndex + 1]) {
        b = buffer[baseIndex + 1];
    }


    // create interpolated sample //
    return (a * (1-diff)) + (b * diff);
}

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

function StereoInterpolate(buffer,i) {

    // get indices //
    var baseIndex = Math.floor(i);
    var diff = i - baseIndex;


    // allow for zeroed samples if a sample index doesn't exist //
    var a = [0,0];
    var b = [0,0];
    if (buffer[0][baseIndex]) {
        a = [buffer[0][baseIndex],buffer[1][baseIndex]];
    }
    if (buffer[0][baseIndex + 1]) {
        b = [buffer[0][baseIndex + 1],buffer[1][baseIndex + 1]];
    }


    // create interpolated sample //
    return [
        (a[0] * (1-diff)) + (b[0] * diff),
        (a[1] * (1-diff)) + (b[1] * diff)
    ];
}



module.exports = StereoInterpolate;