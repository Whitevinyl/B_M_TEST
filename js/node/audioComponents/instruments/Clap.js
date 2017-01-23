var utils = require('../../lib/utils');
var easing = require('../../lib/easing');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var Roar = require('../voices/Roar');
var White = require('../voices/White');
var Repeater = require('../common/Repeater');
var Tremolo = require('../filters/Tremolo');
var Resonant = require('../filters/Resonant');
var drive = require('../filters/FoldBackII');

var Expander = require('../filters/StereoExpander');

// adapted from the clap sound in my (still early WIP) EvolverDrum

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function ClapPlayer() {
    this.instances = [];
    this.markers = [];
    this.adsr = [0,60,0,260];
    this.markers.push(new marker(audioClock.getBeatLength('4'),1,440,this.adsr,audioClock.getBeatLength('4')));
    this.markers.push(new marker(audioClock.getBeatLength('D2'),1,440,this.adsr,audioClock.getBeatLength('4')));
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
    this.voice = new Roar(tombola.rangeFloat(0.2,0.6));
    this.p = 0; // panning;

    // envelope / duration //
    this.i = 0;
    this.a = 0;
    this.duration = duration || sampleRate;
    this.adsr = adsr || [1,10,0.3,89];

    // delay //
    this.delay = new Repeater();
    this.delayTime = tombola.range(2000,3000);
    this.delayAmp = 0.5;

    // filter //
    this.bp = new Resonant.mono();
    this.hp = new Resonant.stereo();
    this.resonance = 0.95;
    this.cutoff = 1220;
    this.dest = 600;

    this.expander = new Expander();

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
    this.a = common.clapEnvelope(this.i,this.duration,this.adsr);

    // voice //
    var n = this.voice.process();

    // filter //
    //var cutoff = easing.cubicInOut(this.i,this.cutoff,this.dest-this.cutoff,this.duration);

    var bp = this.bp.process(1100,0.5,n,'BP');
    n = (n*(1-this.resonance)) + (bp*this.resonance);



    // add panning & amp //
    var boost = 1 + (this.resonance*6);
    var signal = [
        n * ((1 + -this.p) * (this.a * boost)),
        n * ((1 + this.p) * (this.a * boost))
    ];

    // drive //
    //signal = drive(signal,0.1,20,0.4);


    //var hp = this.hp.process(9000,0.8,signal,'HP');
    var hpBoost = 0.3 * this.resonance;
    signal[0] *= (1+hpBoost);
    signal[1] *= (1+hpBoost);
    signal = this.hp.process(signal,16000,0.8,hpBoost,'HP');



    // delay //
    //signal = this.delay.process(signal,this.delayTime,this.delayAmp,true);


    signal = this.expander.process(signal,20);

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



module.exports = ClapPlayer;
