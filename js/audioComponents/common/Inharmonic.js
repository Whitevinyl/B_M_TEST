var utils = require('../../lib/utils');

// A simple inharmonic object, used in an array of inharmonics for the InharmonicSine.
// might change to partial.
// accessible via common.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------


function Inharmonic(ratio,gain) {
    this.ratio = utils.arg(ratio,1);
    this.gain = utils.arg(gain,1);
}

module.exports = Inharmonic;