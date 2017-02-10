
// Calculate envelope balance for normalised output

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------


function sumEnvelopes(envelopes,index) {

    var total = 0;
    var m = envelopes[index];

    var l = envelopes.length;
    for (var i=0; i<l; i++) {
        total += envelopes[i];
    }

    if (total > 1) {
        m = envelopes[index]/total;
    }

    return m;
}


module.exports = sumEnvelopes;