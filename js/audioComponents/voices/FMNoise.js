var utils = require('../../lib/utils');

var Oscillator = require('./Oscillator');

// Oscillator based noise using phase modulation. Like Ableton Operator default routing.

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

proto.process = function(frequency,d1,d2,d3,g1,g2,g3) {

    // init //
    d1 = utils.arg(d1,0);
    d2 = utils.arg(d2,0);
    d3 = utils.arg(d3,0);
    g1 = utils.arg(g1,1);
    g2 = utils.arg(g2,1);
    g3 = utils.arg(g3,1);

    var level = 0.0035; // 0.0035 - good match to Ableton's Operator
    var fm = 0;

    // process, passing fm from one mod to next //
    fm = this.mod3.process('sine',frequency,d3,fm,level) * g3;
    fm = this.mod2.process('sine',frequency,d2,fm,level) * g2;
    fm = this.mod1.process('sine',frequency,d1,fm,level) * g1;
    return this.osc.process('sine',frequency,0,fm,level);
};


module.exports = FMNoise;
