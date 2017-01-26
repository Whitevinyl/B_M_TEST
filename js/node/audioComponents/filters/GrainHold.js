var utils = require('../../lib/utils');
var common = require('../common/Common');
var Tombola = require('tombola');
var tombola = new Tombola();

var Resonant = require('./Resonant');
var Perlin = require('../voices/Perlin');
var Glide = require('../mods/Glide');

// first attempt at a random grainular sample hold


//-------------------------------------------------------------------------------------------
//  DELAY INIT
//-------------------------------------------------------------------------------------------


function GrainHold() {
    this.memory = [[],[]];
    this.feedbackSample = [0,0];
    this.grains = [];
    this.i = 5000;

    this.filter = new Resonant.stereo();
}
var proto = GrainHold.prototype;


//-------------------------------------------------------------------------------------------
//  HOLD PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,delay,size,hold,speed,reverse,feedback,mix) {
    var i, l;


    // convert speed from interval //
    speed = utils.intervalToRatio(speed)-1;


    // calculate required buffer time //
    var s = speed;
    if (s<0) s = -s;
    var buffer = (size * (1+s));



    // inject stored feedback to buffer //
    feedback = utils.valueInRange(feedback/100, 0, 0.75);
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


        // REVERSE //
        var direction = 1;
        if (reverse) {
            direction = -1;
        }


        // CREATE GRAINS //
        this.i--;
        if (this.i<1) {
            this.i = tombola.range(20000,50000);
            this.i = 10000;

            this.grains.push( new Grain(this.grains,this.memory,delay,hold,speed,direction) );
        }




        // PROCESS ACTIVE GRAINS //
        l = this.grains.length-1;
        for (i=l; i>=0; i--) {
            grainSignal = this.grains[i].process(grainSignal, 1);
        }
        grainSignal[0] *= 0.6;
        grainSignal[1] *= 0.6;
    }


    // FILTER //
    grainSignal = this.filter.process(grainSignal,3100,0.4,0.8,'LP');
    this.feedbackSample = grainSignal;

    // RETURN MIX //
    return [
        (signal[0]) + (grainSignal[0] * mix),
        (signal[1]) + (grainSignal[1] * mix)
    ];
};







//-------------------------------------------------------------------------------------------
//  GRAIN INIT
//-------------------------------------------------------------------------------------------


function Grain(parentArray,buffer,delay,hold,speed,direction) {
    this.parentArray = parentArray;
    this.buffer = [buffer[0].slice(),buffer[1].slice()];
    this.fade = Math.round((buffer[0].length-1) * 0.5);
    this.delay = delay;
    this.hold = hold;
    this.speed = direction + (speed * direction);
    this.i = 0;

    this.playHead = 1;
    if (direction === -1) this.playHead = buffer[0].length-1;

    this.crossFade();
    //console.log(this.fade);
}
proto = Grain.prototype;


//-------------------------------------------------------------------------------------------
//  GRAIN PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,mix) {

    // COUNT DOWN DELAY //
    if (this.delay>0) {
        this.delay--;
        return signal;
    }

    // PLAY GRAIN //
    else {
        var size = this.buffer[0].length-1;

        // COUNT / KILL //
        this.i++;
        if (this.i>=this.hold) {
            this.kill();
            return signal;
        }


        // MOVE PLAYHEAD //
        this.playHead += this.speed;


        // LOOP //
        var a = 1;
        var b = size - this.fade;

        if (this.speed > 0) {
            if (this.playHead >= b) {
                this.playHead = a;
            }
        }
        else {
            if (this.playHead <= a) {
                this.playHead = b;
            }
        }


        // AMP / FADES //
        var amp = 1;
        var fade = 0.4;

        var ml = Math.floor(this.hold * fade);
        if (this.i < ml) {
            amp = (this.i/ml);
        }
        if (this.i > (this.hold - ml)) {
            amp = 1 - ((this.i -(this.hold - ml))/ml);
        }
        amp *= mix;


        // GET SAMPLE //
        var sample = common.interpolate(this.buffer,this.playHead);



        // RETURN MIX //
        return [
            signal[0] + (sample[0] * amp),
            signal[1] + (sample[1] * amp)
        ];
    }
};

//-------------------------------------------------------------------------------------------
//  GRAIN CREATE CROSSFADE
//-------------------------------------------------------------------------------------------

proto.crossFade = function() {

    var buffer = this.buffer;
    var length = buffer[0].length-1;

    for (var i=0; i<this.fade; i++) {
        var mix = (i/this.fade);
        var i2 = length - this.fade + i;
        buffer[0][i] = (buffer[0][i] * (1-mix)) + (buffer[0][i2] * mix);
        buffer[1][i] = (buffer[1][i] * (1-mix)) + (buffer[1][i2] * mix);
    }
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


module.exports = GrainHold;





