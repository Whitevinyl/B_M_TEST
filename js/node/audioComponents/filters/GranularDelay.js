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
    this.hp = new Resonant.stereo();
}
var proto = GranularDelay.prototype;


//-------------------------------------------------------------------------------------------
//  PITCH-SHIFT PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,delay,density,size,speed,mix) {
    var i, l;
    var grainSignal = [0,0];
    // size of 900 is good (20.4 milliseconds) //

    var feedback = 0.7;

    // convert speed from interval //
    speed = utils.intervalToRatio(speed)-1;


    // calculate required buffer time //
    var space = size;
    var s = speed;
    if (s<0) s = -s;
    var buffer = delay + size;


    // set rate of grain creation //
    var rate = size*0.1;

    // filter incoming before recording //
    var memorySample = [
        signal[0] + (this.feedbackSample[0] * feedback),
        signal[1] + (this.feedbackSample[1] * feedback)
    ];
    memorySample = this.lp.process(memorySample,6000,0.96);


    // record to sample buffer for the grains to use //
    this.memory[0].push(memorySample[0]);
    this.memory[1].push(memorySample[1]);


    // we have enough buffer - let's go //
    l = this.memory[0].length;
    if (l>buffer) {

        // trim memory buffer length //
        while (this.memory[0].length > buffer*2) {
            this.memory[0].shift();
            this.memory[1].shift();
        }

        // create grains //
        this.i++;
        if (this.i>rate  && this.grains.length<density) {
            this.i = 0;
            var position = tombola.range(buffer, (buffer*2) - 1);
            if (speed<0) {
                position = buffer - position;
            }
            var bl = this.memory[0].length-1;
            this.grains.push( new Grain(this.grains,this.memory,tombola.range(bl - delay - 200, bl - delay),size,speed) );
        }


        // process any active instances //
        l = this.grains.length-1;

        for (i=l; i>=0; i--) {
            grainSignal = this.grains[i].process(grainSignal, 1);
        }
        grainSignal[0] *= (1/(density/3));
        grainSignal[1] *= (1/(density/3));
    }

    // feedback //
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
    var fade = 0.25;
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
    var p = tombola.rangeFloat(-1,1);

    // mix //
    return [
        (signal[0]) + (sample[1] * amp * (1 + -p)),
        (signal[1]) + (sample[0] * amp * (1 + p))
    ];
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



