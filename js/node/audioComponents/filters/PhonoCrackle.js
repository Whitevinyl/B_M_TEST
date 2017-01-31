var utils = require('../../lib/utils');

var Crackle = require('../voices/CrackleNoise');
var Static = require('../voices/StaticNoise');
var Biquad = require('../filters/Biquad');

// a stereo phono crackle noise. wip

//-------------------------------------------------------------------------------------------
//  STEREO INIT
//-------------------------------------------------------------------------------------------

function PhonoCrackle() {
    this.n1 = new Static();
    this.n2 = new Static();
    this.c1 = new Crackle();
    this.c2 = new Crackle();
    this.filter = new Biquad.stereo();
}

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

PhonoCrackle.prototype.process = function(signal,density,gain,frequency,resonance) {
    var threshold = density/2;
    frequency = utils.arg(frequency,6000);
    resonance = utils.arg(resonance,10);

    var phono = [
        this.n1.process(threshold,gain) + this.c1.process(threshold,gain/4),
        this.n2.process(threshold,gain) + this.c2.process(threshold,gain/4)
    ];
    phono = this.filter.process(phono,'lowpass',frequency,resonance,0);

    return [
        signal[0] + phono[0],
        signal[1] + phono[1]
    ];
};


module.exports = PhonoCrackle;