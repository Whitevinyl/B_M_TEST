var utils = require('../../lib/utils');

// A waveshaping boost/compressor, adapted from: https://github.com/drwolf85/BoostComp

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function BoostComp() {

    this.fParam1 = 0.2; // Drive  // 0.25
    this.fParam2 = 0.25; // Threshold
    this.fParam3 = 0.25; // Gain  // 0.25
    this.fParam4 = 0.50; // Linearity
    this.fParam5 = 0.50; // Asymmetry
    this.fParam6 = 1; // Wet // 1


    this.adj1 = this.fParam1 * 4; // Drive
    this.adj2 = this.fParam2 * 4; // Threshold
    this.adj3 = this.fParam3 * 4; // Gain
    this.adj4 = 0;
    this.adj5 = 0;
    this.asymKonst = this.boost(this.adj5, this.adj1, this.adj2, this.adj3, this.adj4, this.fParam6);
}
var proto = BoostComp.prototype;


//-------------------------------------------------------------------------------------------
//  SET PARAMETER
//-------------------------------------------------------------------------------------------

proto.setParameter = function(param,value) {

    switch(param) {
        case 0: this.fParam1 = value; break;
        case 1: this.fParam2 = value; break;
        case 2: this.fParam3 = value; break;
        case 3: this.fParam4 = value; break;
        case 4: this.fParam5 = value; break;
        case 5: this.fParam6 = value; break;
    }

    this.adj1 = this.fParam1 * 4; // Drive
    this.adj2 = this.fParam2 * 4; // Threshold
    this.adj3 = this.fParam3 * 4; // Gain

    var exp = 0.000001;
    if (this.adj1 < exp) this.adj1 = exp;
    if (this.adj2 < exp) this.adj2 = exp;

    this.adj4 = this.fParam4 * 8 - 4; // Linearity
    this.adj5 = this.fParam5 * 2 - 1  ; // Asymmetry
    this.asymKonst = this.boost(this.adj5, this.adj1, this.adj2, this.adj3, this.adj4, this.fParam6);
};


//-------------------------------------------------------------------------------------------
//  BOOST
//-------------------------------------------------------------------------------------------

proto.boost = function(signal,drive,threshold,gain,linearity,wet) {

    var res = gain * Math.atan(signal * drive) / Math.atan(drive / threshold);
    res = linearity * signal - (linearity - 1) * res;
    if(res > 0.999) res = 0.999;
    if(res < -0.999) res = -0.999;
    res = res * wet + (1. - wet) * signal;
    if(res > 0.999) res = 0.999;
    if(res < -0.999) res = -0.999;
    return res;
};


//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(signal) {


    return [
        this.boost(this.adj5 + signal[0], this.adj1, this.adj2, this.adj3, this.adj4, this.fParam6) - this.asymKonst,
        this.boost(this.adj5 + signal[1], this.adj1, this.adj2, this.adj3, this.adj4, this.fParam6) - this.asymKonst
    ];
};


module.exports = BoostComp;