var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// A random controller which glides then periodically jumps, in both directions
// or a selected direction.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

// GLIDE //
function Glide() {
    this.p = tombola.rangeFloat(-1,1);
    this.v = tombola.rangeFloat(-1,1)/sampleRate;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------


Glide.prototype.process = function(r,c,d) {
    this.p += this.v;
    if (this.p<-1 || this.p>1 || tombola.chance(1,c) || (d && d>0 && this.v<0) || (d && d<0 && this.v>0)) {
        var mn = -r;
        var mx = r;
        if (d && d>0) mn = 0;
        if (d && d<0) mx = 0;
        this.p = tombola.rangeFloat(-1,1);
        this.v = tombola.rangeFloat(mn,mx)/sampleRate;
    }
    return utils.valueInRange(this.p,-1,1);
};

module.exports = Glide;