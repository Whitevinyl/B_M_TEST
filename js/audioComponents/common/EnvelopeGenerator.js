var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var EnvelopePoint = require('./EnvelopePoint');

// Returns individual shapes, or complete envelopes for use in MultiEnvelopes.
// accessible via common.shape(), common.randomEnvelope()

// Similar to how 'Performer' works in Native Instruments' synth, Massive. Main difference
// is that times are irregular unless a grid/quantise time is specified

// times are all in milliseconds.
// see also: EnvelopePoint & MultiEnvelope


//-------------------------------------------------------------------------------------------
//  SHAPES
//-------------------------------------------------------------------------------------------

function shape(time,type,gainA,gainB) {

    var block = [];

    // set or randomise type //
    type = utils.arg(type, tombola.item(['in','out','inOut','jumpIn','jumpOut','jumpInOut','sustain']));


    // set or randomise time //
    time = utils.arg(time, tombola.rangeFloat(8,13));


    // set or randomise gains //
    var g0 = utils.arg(gainA, tombola.weightedItem([0, 1, tombola.rangeFloat(0,1)], [1,1,3]));
    var g1 = utils.arg(gainB, tombola.rangeFloat(0,1));


    switch (type) {


        case 'in':
            block.push(new EnvelopePoint(time,g0,'In'));
            break;


        case 'out':
            block.push(new EnvelopePoint(time,g0,'Out'));
            break;


        case 'inOut':
            block.push(new EnvelopePoint(time,g0,'InOut'));
            break;


        case 'jumpIn':
            block.push(new EnvelopePoint(0,g0,'In'));
            block.push(new EnvelopePoint(time,g1,'In'));
            break;


        case 'jumpOut':
            block.push(new EnvelopePoint(0,g0,'Out'));
            block.push(new EnvelopePoint(time,g1,'Out'));
            break;


        case 'jumpInOut':
            block.push(new EnvelopePoint(0,g0,'InOut'));
            block.push(new EnvelopePoint(time,g1,'InOut'));
            break;


        case 'sustain':
            block.push(new EnvelopePoint(time,-1,'In'));
            break;
    }

   return block;
}


function addShape(envelope,shape) {
    return envelope.concat(shape);
}


//-------------------------------------------------------------------------------------------
//  CREATE RANDOM ENVELOPE
//-------------------------------------------------------------------------------------------

function randomEnvelope(duration,gridTime) {

    var env = [];
    while (duration > 0) {

        // set or randomise time //
        var time = gridTime || tombola.range(5,100);

        // create & add an envelope shape //
        addShape(env, shape(time));
        duration -= time;
    }

    return env;
}


module.exports = {
    shape: shape,
    addShape: addShape,
    randomEnvelope: randomEnvelope
};