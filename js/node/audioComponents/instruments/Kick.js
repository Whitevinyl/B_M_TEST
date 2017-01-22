var utils = require('../../lib/utils');
var easing = require('../../lib/easing');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var Sine = require('../voices/Sine');


//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function KickPlayer() {
    this.instances = [];
    this.markers = [];
    this.adsr = [0.1,9.9,0.2,90];
    this.markers.push(new marker(tombola.weightedItem([0,audioClock.getBeatLength('16')],[2,1]),1,440,this.adsr,audioClock.getBeatLength('16')));
    this.markers.push(new marker(audioClock.getBeatLength('8') + (audioClock.getBeatLength('16')*(tombola.range(0,11))),1,440,this.adsr,audioClock.getBeatLength('16')));
}
var proto = KickPlayer.prototype;


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
            this.instances.push( new Kick(this.instances,marker.adsr,marker.duration));
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
//  KICK INIT
//-------------------------------------------------------------------------------------------

function Kick(parentArray,adsr,duration) {

    // voice //
    this.voice = new Sine();
    this.pitch = 50;
    this.p = 0; // panning;

    // envelope / duration //
    this.i = 0;
    this.a = 0;
    this.duration = duration || sampleRate;
    this.adsr = adsr || [1,10,0.3,89];


    // where we're stored //
    this.parentArray = parentArray;
}
proto = Kick.prototype;

//-------------------------------------------------------------------------------------------
//  CLAP PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(input,level) {

    // count //
    this.i++;
    if (this.i >= this.duration) {
        this.kill();
    }

    // envelope //
    this.a = common.ADSREnvelope(this.i, this.duration, this.adsr);

    // voice //
    var n = this.voice.process(this.pitch);
    this.pitch = common.rampEnvelope(this.i, this.duration, 60, 40, 10, 35,'circleOut');

    var signal = [
        n * ((1 + -this.p) * (this.a)),
        n * ((1 +  this.p) * (this.a))
    ];


    // return with ducking //
    var ducking = 0.5;
    return [
        (input[0] * (1-(this.a * ducking))) + signal[0],
        (input[1] * (1-(this.a * ducking))) + signal[1]
    ];
};


//-------------------------------------------------------------------------------------------
//  KICK KILL
//-------------------------------------------------------------------------------------------

// remove from parent object //
proto.kill = function() {
    var index = this.parentArray.indexOf(this);
    if (index > -1) {
        this.parentArray.splice(index, 1);
    }
};



module.exports = KickPlayer;