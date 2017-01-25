var utils = require('../../lib/utils');
var common = require('../common/Common');
var Tombola = require('tombola');
var tombola = new Tombola();

var Resonant = require('./Resonant');
var Q = require('./Q');
var lowPass = require('./LowPass');
var Perlin = require('../voices/Perlin');

// second attempt at a granular delay, with multiple moving sources


//-------------------------------------------------------------------------------------------
//  PITCH-SHIFT INIT
//-------------------------------------------------------------------------------------------


function GranularDelayII() {
    this.memory = [[],[]];
    this.feedbackSample = [0,0];
    this.grains = [];
    this.i = 0;

    this.filter = new Resonant.stereo();
    this.mod = new Perlin();
}
var proto = GranularDelayII.prototype;


//-------------------------------------------------------------------------------------------
//  PITCH-SHIFT PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,delay,overlap,size,speed,mix) {
    var i, l;


    // convert speed from interval //
    speed = utils.intervalToRatio(speed)-1;


    // calculate required buffer time //
    var s = speed;
    if (s<0) s = -s;
    var buffer = delay + (size * s);


    // set rate of grain creation from overlap//
    var rate = size * (overlap/100);



    // filter incoming before recording //
    var feedback = 0.75;
    var memorySample = [
        signal[0] + (this.feedbackSample[0] * feedback),
        signal[1] + (this.feedbackSample[1] * feedback)
    ];


    // record to sample buffer for the grains to use //
    this.memory[0].push(memorySample[0]);
    this.memory[1].push(memorySample[1]);




    // we have enough buffer - let's go //
    var grainSignal = [0,0];
    l = this.memory[0].length;
    if (l>1) {

        // trim memory buffer length //
        while (this.memory[0].length > buffer) {
            this.memory[0].shift();
            this.memory[1].shift();
        }


        // origin //
        var bufferLength = Math.min(buffer, this.memory[0].length-1);
        var origin = ((bufferLength - (size*s))/2) + ((delay/2) * this.mod.process(1));
        if (speed<0) {
            origin += (size*s);
        }

        // create grains //
        this.i++;
        if (this.i>rate) {
            this.i = 0;


            var range = Math.min(bufferLength/2,2000);
            var position = tombola.range(origin - range, origin + range);


            this.grains.push( new Grain(this.grains,this.memory,position,size,speed) );
        }


        // process any active instances //
        l = this.grains.length-1;
        for (i=l; i>=0; i--) {
            grainSignal = this.grains[i].process(grainSignal, 1);
        }
        grainSignal[0] *= (overlap/100);
        grainSignal[1] *= (overlap/100);
    }

    // feedback //
    grainSignal = this.filter.process(grainSignal,3100,0.4,0.8,'LP');
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
    this.pan = tombola.rangeFloat(-0.6,0.6);
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
    var fade = 0.4;
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
        (signal[0]) + (sample[0] * amp),
        (signal[1]) + (sample[1] * amp)
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


module.exports = GranularDelayII;




