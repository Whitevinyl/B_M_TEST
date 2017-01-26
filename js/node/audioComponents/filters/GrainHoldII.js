var utils = require('../../lib/utils');
var common = require('../common/Common');
var Tombola = require('tombola');
var tombola = new Tombola();

var Resonant = require('./Resonant');
var Perlin = require('../voices/Perlin');
var Glide = require('../mods/Glide');

// second attempt at a random grainular sample hold

//-------------------------------------------------------------------------------------------
//  HOLD INIT
//-------------------------------------------------------------------------------------------


function GrainHoldII() {
    this.memory = [[],[]];
    this.feedbackSample = [0,0];
    this.grainPlayers = [];
    this.i = 5000;

    this.filter = new Resonant.stereo();
}
var proto = GrainHoldII.prototype;


//-------------------------------------------------------------------------------------------
//  HOLD PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,hold,size,overlap,speed,reverse,feedback,mix) {
    var i, l;


    // convert speed from interval //
    speed = utils.intervalToRatio(speed)-1;


    // calculate required buffer time //
    var s = speed;
    if (s<0) s = -s;
    var buffer = ((size*3) * (1+s));



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


        // CREATE GRAIN PLAYERS //
        this.i--;
        if (this.i<1) {
            this.i = tombola.range(20000,50000);

            this.grainPlayers.push( new GrainPlayer(this.grainPlayers,this.memory,hold,size,overlap,speed,direction) );
        }




        // PROCESS ACTIVE GRAIN PLAYERS //
        l = this.grainPlayers.length-1;
        for (i=l; i>=0; i--) {
            grainSignal = this.grainPlayers[i].process(grainSignal, 0.5);
        }
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
//  GRAIN PLAYER
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//  GRAIN PLAYER INIT
//-------------------------------------------------------------------------------------------

function GrainPlayer(parentArray,buffer,hold,grainSize,overlap,speed,direction) {
    this.grains = [];

    this.parentArray = parentArray;
    this.buffer = [buffer[0].slice(),buffer[1].slice()];
    this.hold = hold;
    this.grainSize = grainSize;
    this.overlap = overlap;
    this.speed = speed;
    this.direction = direction;

    this.i = 0;
    this.life = 0;
}
proto = GrainPlayer.prototype;

//-------------------------------------------------------------------------------------------
//  GRAIN PLAYER PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,mix) {

    // COUNT / KILL //
    this.life++;
    if (this.life>=this.hold) {
        this.kill();
        return signal;
    }

    var j,le;
    var grainSignal = [0,0];
    var trigger = this.grainSize - this.overlap;


    // CREATE GRAINS //
    this.i++;
    if (this.i >= trigger) {
        this.i = 0;
        var position = tombola.range(0,(this.buffer[0].length-1) - this.grainSize);
        if (this.direction === -1) {
            position += this.grainSize;
        }
        this.grains.push( new Grain(this.grains,this.buffer,this.grainSize,position,this.speed,this.direction) );
    }


    // PROCESS ACTIVE GRAINS //
    le = this.grains.length-1;
    for (j=le; j>=0; j--) {
        grainSignal = this.grains[j].process(grainSignal, 0.5);
    }


    // ENVELOPE //
    var amp = common.fadeEnvelope(this.life,this.hold,0.4);


    // RETURN MIX //
    return [
        (signal[0]) + (grainSignal[0] * (amp * mix)),
        (signal[1]) + (grainSignal[1] * (amp * mix))
    ];
};

//-------------------------------------------------------------------------------------------
//  GRAIN PLAYER KILL
//-------------------------------------------------------------------------------------------

// remove from parent object //
proto.kill = function() {
    var index = this.parentArray.indexOf(this);
    if (index > -1) {
        this.parentArray.splice(index, 1);
    }
};





//-------------------------------------------------------------------------------------------
//  GRAIN
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//  GRAIN INIT
//-------------------------------------------------------------------------------------------


function Grain(parentArray,buffer,size,position,speed,direction) {
    this.parentArray = parentArray;
    this.buffer = buffer;
    this.size = size;
    this.position = position;
    this.speed = direction + (speed * direction);
    this.i = 0;

    this.playHead = 1;
    if (direction === -1) this.playHead = buffer[0].length-1;

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

        // COUNT / KILL //
        this.i++;
        if (this.i>=this.size) {
            this.kill();
            return signal;
        }


        // MOVE PLAY-HEAD //
        this.playHead += this.speed;



        // AMP / FADES //
        var amp = common.fadeEnvelope(this.i,this.size,0.2);


        // GET SAMPLE //
        var sample = common.interpolate(this.buffer,this.playHead);



        // RETURN MIX //
        return [
            signal[0] + (sample[0] * (amp * mix)),
            signal[1] + (sample[1] * (amp * mix))
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


module.exports = GrainHoldII;






