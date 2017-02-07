var utils = require('../../lib/utils');

// A generic multi-oscillator, with detune & phase modulation

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Oscillator() {
    this.i = 0;
    this.pulseWidth = 0.5;
    this.phase = 0;
    this.phaseDepth = 0;
}
var proto = Oscillator.prototype;

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(type,frequency,detune,phase,phaseDepth) {

    type = utils.arg(type,'sine');
    frequency = utils.arg(frequency,220);
    detune = utils.arg(detune,0);
    phase = utils.arg(phase,this.phase);
    phaseDepth = utils.arg(phaseDepth,this.phaseDepth);


    // progress time //
    this.i += 1/sampleRate;
    var t = this.i * (phase * phaseDepth);
    var f = frequency * utils.intervalToRatio(detune);


    // plot wave //
    var out;
    switch (type) {

        case 'sine':
            out = Math.sin(f * (t * utils.TAU));
            break;

        case 'saw':
            out = 1 - 2 * (t % (1 / f)) * f;
            break;

        case 'ramp':
            out = 2 * (t % (1 / f)) * f - 1;
            break;

        case 'triangle':
            out = Math.abs(1 - (2 * t * f) % 2) * 2 - 1;
            break;

        case 'square':
            out = (t*f % 1/f < 1/f/2) * 2 - 1;
            break;

        case 'pulse':
            out = (t*f % 1/f < 1/f/2*this.pulseWidth) * 2 - 1;
            break;

    }

    return out;
};


//-------------------------------------------------------------------------------------------
//  SETTINGS
//-------------------------------------------------------------------------------------------


proto.setPulseWidth = function(pw) {
    this.pulseWidth = pw;
};

proto.setPhase = function(phase,depth) {
    this.phase = phase;
    this.phaseDepth = depth;
};



module.exports = Oscillator;