
var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var HarmonicSine = require('./HarmonicSine');
var partials = require('../../lib/partials');
var common = require('../common/Common');

// A voice wrapper for the 'HarmonicSine' which takes a cutoff value and converts it into
// partials, modulating that value then creates the sound of opening up or closing off the
// harmonics, feeling like a cutoff filter but with different timbre characteristics.

// REMINDER - to myself - have changed to work as mono generator, not like filter.
//            No longer outputs mix or stereo.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function HarmonicVoice() {
    this.voice = new HarmonicSine;
    this.partials = [1];
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

HarmonicVoice.prototype.process = function(frequency, cutoff, resonance, mode) {

    // get partials from cutoff (1-100 ideal) //
    var p = floatToPartials(cutoff);

    // alter partials //
    mode = mode || null;
    switch (mode) {
        case 'metallic':
            partials.negativeDisorganise(p,0.4,3);
            break;

        case 'tine':
            partials.negativePeakInterval(p,4,0);
            partials.negativeLowPass(p,0.8,0);
            break;

        case 'metallic2':
            partials.negativePeakInterval(p,5,0);
            partials.negativeLowPass(p,0.8,0);
            break;

        case 'metallic3':
            partials.negativePeakInterval(p,3,0);
            partials.negativeLowPass(p,0.8,0);
            break;

        default:
            break;
    }

    // voice //
    return  this.voice.process(frequency,p,resonance);

};


function floatToPartials(n) {
    var l = Math.floor(n);
    var a = [];
    for (var i=0; i<l; i++) {
        a.push(1);
    }
    a.push(n-l);
    return a;
}



module.exports = HarmonicVoice;

