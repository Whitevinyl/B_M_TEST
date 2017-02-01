// combines multiple signals in an array

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function combine(signalArray) {

    var l = signalArray.length;
    var signal = [0,0];
    for (var i=0;i<l;i++) {
        signal[0] += signalArray[i][0];
        signal[1] += signalArray[i][1];
    }

    return signal;
}

module.exports = combine;