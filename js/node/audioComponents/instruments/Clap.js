var utils = require('../../lib/utils');
var easing = require('../../lib/easing');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var Roar = require('../voices/Roar');
var Repeater = require('../common/Repeater');
var Tremolo = require('../filters/Tremolo');
var Resonant = require('../filters/Resonant');

// adapted from the clap sound in my (still early WIP) EvolverDrum

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function ClapPlayer() {
    this.instances = [];
    this.markers = [];
    this.adsr = [0.1,7.9,0.3,92];
    this.markers.push(new marker(audioClock.getBeatLength('2'),1,440,this.adsr,audioClock.getBeatLength('4')));
}
var proto = ClapPlayer.prototype;


//-------------------------------------------------------------------------------------------
//  PLAYER PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,level,index) {
    var l,i;

    // add instance if we hit a marker //
    l = this.markers.length;
    for (i=0; i<l; i++) {
        var marker = this.markers[i];
        if (index === (audioClock.getMeasureIndex() + marker.time)) {
            this.instances.push( new Clap(this.instances,marker.adsr,marker.duration));
        }
    }

    // process any active instances //
    l = this.instances.length-1;
    for (i=l; i>=0; i--) {
        signal = this.instances[i].process(signal,level);
    }

    return signal;
};



//-------------------------------------------------------------------------------------------
//  CLAP INIT
//-------------------------------------------------------------------------------------------

function Clap(parentArray,adsr,duration) {

    // voice //
    this.voice = new Roar(0.8);
    this.p = 0; // panning;

    // envelope / duration //
    this.i = 0;
    this.a = 0;
    this.duration = duration || sampleRate;
    this.adsr = adsr || [1,10,0.3,89];

    // delay //
    this.delay = new Repeater();
    this.delayTime = tombola.range(1600,2600);
    this.delayAmp = 0.5;

    // filter //
    this.bp = new Resonant.mono();
    this.hp = new Resonant.mono();
    this.cutoff = 1300;

    // where we're stored //
    this.parentArray = parentArray;
}
proto = Clap.prototype;

//-------------------------------------------------------------------------------------------
//  CLAP PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(input,level) {

    // count //
    this.i++;
    if (this.i>=this.duration) {
        this.kill();
    }

    // envelope //
    this.a = common.ADSREnvelope(this.i,this.duration,this.adsr);

    // voice //
    var n = this.voice.process();

    // filter //
    var cutoff = easing.cubicOut(this.i,this.cutoff,600,Math.floor(this.duration*0.2));
    n = this.bp.process(1300,0.7,n,'BP');
    n = this.hp.process(850,0.5,n,'HP');

    // add panning & amp //
    var boost = 2;
    var signal = [
        n * ((1 + -this.p) * (this.a * boost)),
        n * ((1 + this.p) * (this.a * boost))
    ];

    // delay //
    signal = this.delay.process(signal,this.delayTime,this.delayAmp,true);


    // return with ducking //
    var ducking = 0.5;
    return [
        (input[0] * (1-(this.a * ducking))) + signal[0],
        (input[1] * (1-(this.a * ducking))) + signal[1]
    ];

};

//-------------------------------------------------------------------------------------------
//  CLAP KILL
//-------------------------------------------------------------------------------------------

// remove from parent object //
proto.kill = function() {
    var index = this.parentArray.indexOf(this);
    if (index > -1) {
        this.parentArray.splice(index, 1);
    }
};



/*function Purr() {
    this.voice = new Roar(0.8);
    this.a = 0; // amp
    this.p = 0; // panning;
    this.i = 0; // count
    this.l = 0; // length
    this.v = 0;
    this.tremolo = new Tremolo.stereo();
    this.rate = 0;
    this.depth = 0;
    this.bp = new Resonant.mono();
    this.hp = new Resonant.mono();
    this.attack = 0;
    this.ratio = 0;
    this.direction = 1;
    this.delay = new Repeater();
    this.delayTime = 1;
    this.delayAmp = 1;
}

Purr.prototype.process = function(input,ducking,chance) {

    //setup event //
    if (this.i<0 && tombola.chance(1,chance)) {
        this.voice = new Roar(tombola.rangeFloat(0.2,0.95));
        this.l = tombola.range(12000,100000);
        this.i = 0;
        this.a = 0;
        this.v = tombola.rangeFloat(0.95,1);
        this.rate = tombola.rangeFloat(4,35);
        this.depth = tombola.rangeFloat(1,0.3);
        this.direction = tombola.weightedItem([1,-1],[2,1]);
        this.attack = tombola.rangeFloat(0.5,10);
        this.ratio = tombola.rangeFloat(0.9,1.15);
        this.delayTime = tombola.range(5,500);
        this.delayAmp = tombola.rangeFloat(0,0.5);
    }

    if (this.i>=0) {

        // count //
        this.i++;
        if (this.i>=this.l) {
            this.i = -1;
        }

        // envelope //
        var a = this.attack; var d = 5; var s = 0.6; var r = 100 - (a+d);

        var slices = [(this.l/100)*a, (this.l/100)*d, (this.l/100)*r];
        var volumes = [0,this.v,s,0];
        var currentSlice = 0;
        var sliceIndex = this.i;
        var sl = 0;
        for (var i=0; i<slices.length; i++) {
            sl += slices[i];
            if (this.i>sl)  {
                currentSlice +=1;
                sliceIndex = this.i - sl;
            }
        }
        if (currentSlice < (slices.length)) {
            var currentChange = volumes[currentSlice+1] - volumes[currentSlice];
            this.a = volumes[currentSlice] + ((currentChange/slices[currentSlice]) * sliceIndex);
        }
        else {
            this.a = 0;
        }


        // pan //
        this.p += tombola.rangeFloat(-0.005,0.005);
        this.p = utils.valueInRange(this.p, -1, 1);


        // voice //
        var n = this.voice.process();
        n = this.hp.process(850*this.ratio,0.5,n,'HP');
        n = this.bp.process(1200*this.ratio,0.7,n,'BP');


        var signal = [
            n * ((1 + -this.p) * this.a),
            n * ((1 + this.p) * this.a)
        ];

        // tremolo //
        signal = this.tremolo.process(signal,this.rate,this.depth,this.direction);
        signal = this.delay.process(signal,this.delayTime,this.delayAmp);


        input = [
            (input[0] * (1-(this.a * ducking))) + signal[0],
            (input[1] * (1-(this.a * ducking))) + signal[1]
        ];
    }

    return input;
};*/

module.exports = ClapPlayer;
