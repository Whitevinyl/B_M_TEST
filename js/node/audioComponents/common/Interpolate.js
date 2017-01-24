
// Linear interpolation for playing samples at speeds other than sampleRate

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

function Interpolate(buffer,i) {

    // get indices //
    var baseIndex = Math.floor(i);
    var diff = i - baseIndex;


    // allow for zeroed samples if a sample index doesn't exist //
    var sampleA = [0,0];
    var sampleB = [0,0];
    if (buffer[0][baseIndex]) {
        sampleA = [buffer[0][baseIndex],buffer[1][baseIndex]];
    }
    if (buffer[0][baseIndex + 1]) {
        sampleB = [buffer[0][baseIndex + 1],buffer[1][baseIndex + 1]];
    }


    // create interpolated sample //
    return [
        (sampleA[0] * (1-diff)) + (sampleB[0] * diff),
        (sampleA[1] * (1-diff)) + (sampleB[1] * diff)
    ];
}



module.exports = Interpolate;