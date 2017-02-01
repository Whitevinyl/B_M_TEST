var utils = require('../../lib/utils');
var common = require('../common/Common');
var Tombola = require('tombola');
var tombola = new Tombola();

var Resonant = require('./Resonant');
var Perlin = require('../voices/Perlin');
var Glide = require('../mods/Glide');

// second attempt at a granular delay, with multiple moving sources


//-------------------------------------------------------------------------------------------
//  DELAY INIT
//-------------------------------------------------------------------------------------------


function GranularDelayIII() {
    this.memory = [[],[]];
    this.feedbackSample = [0,0];
    this.grains = [];
    this.i = 0;

    this.filter = new Resonant.stereo();
    this.mod = new Perlin();

    this.source1 = new Source();
    this.source2 = new Source();
}
var proto = GranularDelayIII.prototype;


//-------------------------------------------------------------------------------------------
//  DELAY PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,delay,overlap,size,scatter,movement,speed,reverse,flip,feedback,mix) {
    var i, l;


    // convert speed from interval //
    speed = utils.intervalToRatio(speed)-1;


    // calculate required buffer time //
    var s = speed;
    if (s<0) s = -s;
    var buffer = ((size) * (1+s));


    // set rate of grain creation from size //
    var trigger = size*0.7;



    // filter incoming before recording //
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


        // FIND DELAY ORIGINS //
        var halfDelay = (delay/2);
        var preDelay = 0;

        var dl1 = preDelay + halfDelay + (delay * this.source1.process(movement,120000));
        var dl2 = preDelay + halfDelay + (delay * this.source2.process(movement,120000));
        var dl = 0;



        // REVERSE //
        var direction = 1;
        if (reverse) {
            direction = -1;
        }


        // CREATE GRAINS //
        this.i++;
        if (this.i>trigger) {
            this.i = 0;


            // source 1 //
            dl = tombola.range(dl1 - scatter, dl1 + scatter);
            this.grains.push( new Grain(this.grains,this.memory,dl,size,speed,direction,flip,overlap,this.source1.panning) );

            // source 2 //
            dl = tombola.range(dl2 - scatter, dl2 + scatter);
            this.grains.push( new Grain(this.grains,this.memory,dl,size,speed,direction,flip,overlap,this.source2.panning) );
        }




        // PROCESS ACTIVE GRAINS //
        l = this.grains.length-1;
        for (i=l; i>=0; i--) {
            grainSignal = this.grains[i].process(grainSignal, 1);
        }
        //console.log(grainSignal);
        grainSignal[0] *= (1/(3+Math.ceil(overlap/size)));
        grainSignal[1] *= (1/(3+Math.ceil(overlap/size)));
    }


    // FILTER & FEEDBACK //
    grainSignal = this.filter.process(grainSignal,3100,0.4,0.8,'LP');
    this.feedbackSample = grainSignal;


    // RETURN MIX //
    return [
        (signal[0]) + (grainSignal[0] * mix),
        (signal[1]) + (grainSignal[1] * mix)
    ];
};



//-------------------------------------------------------------------------------------------
//  SOURCE INIT
//-------------------------------------------------------------------------------------------


function Source() {
    this.panning = tombola.rangeFloat(-1,1);
    this.mod = new Glide();
    this.mod2 = new Perlin();
}
proto = Source.prototype;


//-------------------------------------------------------------------------------------------
//  SOURCE PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(rate,chance) {

    // pan //
    this.panning += tombola.rangeFloat(-0.005,0.005);
    this.panning = utils.valueInRange(this.panning, -1, 1);

    // position //
    return this.mod.process(rate,chance);
    //return this.mod2.process(rate);
};




//-------------------------------------------------------------------------------------------
//  GRAIN INIT
//-------------------------------------------------------------------------------------------


function Grain(parentArray,buffer,delay,size,speed,direction,flip,overlap,pan) {
    this.parentArray = parentArray;
    this.buffer = [buffer[0].slice(),buffer[1].slice()];
    this.delay = delay;
    this.size = size;
    this.overlap = overlap;
    this.speed = direction + (speed * direction);
    this.flip = flip;
    this.panning = pan;
    this.i = 0;

    this.playHead = 1;
    if (direction === -1) this.playHead = size + overlap;

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
        var size = (this.size + this.overlap);

        // COUNT / KILL //
        this.i++;
        if (this.i>=size) {
            this.kill();
            return signal;
        }


        // DO A KICKFLIP //
        if (this.flip && this.i === Math.round(size/2)) {
            this.speed = -this.speed;
        }


        // MOVE PLAYHEAD //
        this.playHead += this.speed;


        // AMP / FADES //
        var amp = 1;
        var fade = 0.15;

        var ml = Math.floor(size * fade);
        if (this.i < ml) {
            amp = (this.i/ml);
        }
        if (this.i > (size - ml)) {
            amp = 1 - ((this.i -(size - ml))/ml);
        }
        amp *= mix;


        // GET SAMPLE //
        var sample = common.interpolate(this.buffer,this.playHead);


        // PANNING //
        sample = common.pan(sample,this.panning);


        // RETURN MIX //
        return [
            signal[0] + (sample[0] * amp),
            signal[1] + (sample[1] * amp)
        ];
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


module.exports = GranularDelayIII;




