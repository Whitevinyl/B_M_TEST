var utils = require('../../lib/utils');
var common = require('../common/Common');
var Tombola = require('tombola');
var tombola = new Tombola();

// was intended to be something else bu ended up as a nice granular pitch-shifter. Will
// keep tweaking as it seems to have a lot of potential.


//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function GranularChorusIII() {
    this.memory = [[],[]];
    this.grains = [];
    this.i = 0;
}
var proto = GranularChorusIII.prototype;


//-------------------------------------------------------------------------------------------
//  PLAYER PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,delay,size,speed,mix) {
    var i,l;
    /*if (size>(delay*0.75)) {
        size = delay * 0.75;
    }*/
    var rate = size*0.3;

    // record to sample buffer for later //
    this.memory[0].push(signal[0]);
    this.memory[1].push(signal[1]);

    // we have enough buffer - let's go //
    if (this.memory[0].length>delay) {

        // trim memory buffer length //
        while (this.memory[0].length > (delay*2)) {
            this.memory[0].shift();
            this.memory[1].shift();
        }


        // create grains //
        this.i++;
        if (this.i>rate) {
            this.i = 0;
            var pos = 0;
            if (speed<0) {
                pos = Math.floor(delay*0.75);
            }
            var mySpeed = tombola.weightedItem([speed,speed*2,speed*3],[3,2,1]);
            mySpeed = speed;
            this.grains.push( new Grain(this.grains,this.memory,tombola.range(pos,(pos + Math.floor(delay*0.25))),size,mySpeed) );
        }


        // process any active instances //
        l = this.grains.length-1;
        for (i=l; i>=0; i--) {
            signal = this.grains[i].process(signal, mix);
        }
    }

    return signal;
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
    }

    // amp //
    var amp = 1;
    var fade = 0.2;
    var l = Math.floor(this.size * fade);
    if (this.i < l) {
        amp = (this.i/l);
    }
    if (this.i > (this.size - l)) {
        amp = 1 - ((this.i -(this.size - l))/l);
    }
    amp *= mix;


    // get sample //
    var sample = common.interpolate(this.buffer,this.playHead);

    // mix //
    return [
        (signal[0] * (1-amp)) + (sample[1]*amp),
        (signal[1] * (1-amp)) + (sample[0]*amp)
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


module.exports = GranularChorusIII;


