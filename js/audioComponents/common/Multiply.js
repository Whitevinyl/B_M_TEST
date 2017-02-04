
// multiply a stereo signal by  value

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function multiply(signal,value) {
    return [
        signal[0] * value,
        signal[1] * value
    ];
}

module.exports = multiply;
