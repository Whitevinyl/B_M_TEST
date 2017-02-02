
var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// Distortion glitch effect which inverts random samples with a given chance, creating a
// fuzzy crackle

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------

function erode(input,width,index,mix) {
    var out = input;
    if (index % tombola.range(1,width)===0) {
        out = -out;
    }
    return (input * (1-mix)) + (out * mix);
}

//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------

function stereoErode(signal,width,index,mix) {
    mix = utils.arg(mix,1);
    return [
        erode(signal[0],width,index,mix),
        erode(signal[1],width,index,mix)
    ];
}

module.exports = {
    mono: erode,
    stereo: stereoErode
};