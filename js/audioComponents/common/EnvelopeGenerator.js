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


    var types     = ['in','out','inOut','sustain','jumpIn','jumpOut','jumpInOut','jumpSustain'];
    var rareTypes = ['hardInUp', 'hardInDown', 'hardOutUp', 'hardOutDown', 'hardInOutUp', 'hardInOutDown'];
    if (tombola.percent(10)) {
        types.concat(rareTypes);
    }

    // set or randomise type //
    type = utils.arg(type, tombola.item(types));


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


        case 'sustain':
            block.push(new EnvelopePoint(time,-1,'In'));
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


        case 'jumpSustain':
            block.push(new EnvelopePoint(0,g1,'In'));
            block.push(new EnvelopePoint(time,-1,'In'));
            break;


        case 'hardInUp':
            g0 = utils.arg(gainA, 1);
            block.push(new EnvelopePoint(0,0,'In'));
            block.push(new EnvelopePoint(time,g0,'In'));
            break;


        case 'hardOutUp':
            g0 = utils.arg(gainA, 1);
            block.push(new EnvelopePoint(0,0,'Out'));
            block.push(new EnvelopePoint(time,g0,'Out'));
            break;


        case 'hardInOutUp':
            g0 = utils.arg(gainA, 1);
            block.push(new EnvelopePoint(0,0,'InOut'));
            block.push(new EnvelopePoint(time,g0,'InOut'));
            break;

        case 'hardInDown':
            g0 = utils.arg(gainA, 1);
            block.push(new EnvelopePoint(0,g0,'In'));
            block.push(new EnvelopePoint(time,0,'In'));
            break;


        case 'hardOutDown':
            g0 = utils.arg(gainA, 1);
            block.push(new EnvelopePoint(0,g0,'Out'));
            block.push(new EnvelopePoint(time,0,'Out'));
            break;


        case 'hardInOutDown':
            g0 = utils.arg(gainA, 1);
            block.push(new EnvelopePoint(0,g0,'InOut'));
            block.push(new EnvelopePoint(time,0,'InOut'));
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
    var time;
    var minTime = 5;
    var maxTime = 100;

    // FIRST SHAPE //

    // set or randomise time //
    time = gridTime || tombola.range(minTime,maxTime);

    // create & add a shape, checking it's not a zero-sustain //
    var s = shape(time);
    while (s[0].gain === -1 || (s[0].gain === 0 && s[0].time > 0)) { s = shape(time); }
    env = addShape(env, s);
    duration -= time;


    // REMAINING SHAPES //
    while (duration > 0) {

        // set or randomise time //
        time = gridTime || tombola.range(minTime,maxTime);

        // create & add a shape //
        env = addShape(env, shape(time));
        duration -= time;
    }

    return env;
}


module.exports = {
    shape: shape,
    addShape: addShape,
    randomEnvelope: randomEnvelope
};