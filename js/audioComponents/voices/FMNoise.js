var utils = require('../../lib/utils');

var Oscillator = require('./Oscillator');

// Oscillator based noise using phase modulation

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function FMNoise() {
    this.osc = new Oscillator();
    this.mod1 = new Oscillator();
    this.mod2 = new Oscillator();
    this.mod3 = new Oscillator();
}
var proto = FMNoise.prototype;


//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(frequency,d1,d2,d3) {

    var level = 0.004;
    var phase = 0;
    phase = this.mod3.process('sine',frequency,d3);
    phase = this.mod2.process('sine',frequency,d2,phase,level);
    phase = this.mod1.process('sine',frequency,d1,phase,level);

    return this.osc.process('sine',frequency,0,phase,level);
};


module.exports = FMNoise;
