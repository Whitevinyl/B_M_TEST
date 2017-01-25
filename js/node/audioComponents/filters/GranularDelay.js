var utils = require('../../lib/utils');
var common = require('../common/Common');
var Tombola = require('tombola');
var tombola = new Tombola();

var Resonant = require('./Resonant');
var lowPass = require('./LowPass');

// first attempt at a granular delay


//-------------------------------------------------------------------------------------------
//  PITCH-SHIFT INIT
//-------------------------------------------------------------------------------------------


function GranularDelay() {
    this.memory = [[],[]];
    this.feedbackSample = [0,0];
    this.grains = [];
    this.i = 0;

    this.lp = new lowPass.stereo();
    this.lp2 = new lowPass.stereo();
}
var proto = GranularDelay.prototype;


//-------------------------------------------------------------------------------------------
//  PITCH-SHIFT PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,delay,density,size,speed,mix) {
    var i, l;
    var grainSignal = [0,0];
    // size of 900 is good (20.4 milliseconds) //

    var feedback = 0.75;

    // convert speed from interval //
    speed = utils.intervalToRatio(speed)-1;


    // calculate required buffer time //
    var space = size;
    var s = speed;
    if (s<0) s = -s;
    var buffer = delay;


    // set rate of grain creation //
    var rate = size*0.2;

    // filter incoming before recording //
    var memorySample = [
        signal[0] + (this.feedbackSample[0] * feedback),
        signal[1] + (this.feedbackSample[1] * feedback)
    ];
    //memorySample = this.lp.process(memorySample,6000,0.95);


    // record to sample buffer for the grains to use //
    this.memory[0].push(memorySample[0]);
    this.memory[1].push(memorySample[1]);


    // we have enough buffer - let's go //
    l = this.memory[0].length;
    if (l>10) {

        // trim memory buffer length //
        while (this.memory[0].length > buffer*1.5) {
            this.memory[0].shift();
            this.memory[1].shift();
        }

        // create grains //
        this.i++;
        if (this.i>rate  && this.grains.length<(density+1)) {
            this.i = 0;

            var pd = 600;
            var bl = this.memory[0].length-pd-1;
            var position = tombola.range(bl - Math.min(bl,delay), bl);
            var orig = bl - Math.min(bl,10000);
            position = tombola.range(orig, orig + Math.min(bl,10000));
            this.grains.push( new Grain(this.grains,this.memory,position,size,speed) );
        }


        // process any active instances //
        l = this.grains.length-1;
        for (i=l; i>=0; i--) {
            grainSignal = this.grains[i].process(grainSignal, 1);
        }
        grainSignal[0] *= (1/(density));
        grainSignal[1] *= (1/(density));
    }

    // feedback //
    grainSignal = this.lp2.process(grainSignal,7000,1);
    this.feedbackSample = grainSignal;

    // mix //
    return [
        (signal[0]) + (grainSignal[0] * mix),
        (signal[1]) + (grainSignal[1] * mix)
    ];
};



//-------------------------------------------------------------------------------------------
//  GRAIN INIT
//-------------------------------------------------------------------------------------------


function Grain(parentArray,buffer,position,size,speed) {
    this.parentArray = parentArray;
    this.buffer = buffer;
    this.origin = position;
    this.playHead = position;
    this.size = size;
    this.speed = speed;
    this.i = 0;
    this.pan = tombola.rangeFloat(-1,1);
}
proto = Grain.prototype;


//-------------------------------------------------------------------------------------------
//  GRAIN PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,mix) {

    this.playHead += this.speed;

    this.i++;
    if (this.i>=this.size) {
        this.kill();
        return signal;
    }

    // amp //
    var amp = 1;
    var fade = 0.1;
    var ml = Math.floor(this.size * fade);
    if (this.i < ml) {
        amp = (this.i/ml);
    }
    if (this.i > (this.size - ml)) {
        amp = 1 - ((this.i -(this.size - ml))/ml);
    }
    amp *= mix;


    // get sample //
    var sample = common.interpolate(this.buffer,this.playHead);

    // pan //
    //sample = common.toMono(sample);
    //sample = common.pan(sample,this.pan);


    // mix //
    return [
        (signal[0]) + (sample[1] * amp),
        (signal[1]) + (sample[0] * amp)
    ];
    //  * (1 + -p)
};

//-------------------------------------------------------------------------------------------
//  GRAIN KILL
//-------------------------------------------------------------------------------------------

// remove from parent object //
proto.kill = function() {
    var index = this.parentArray.indexOf(this);
    if (index > -1) {
        this.parentArray.splice(index, 1);
    }
};


module.exports = GranularDelay;



