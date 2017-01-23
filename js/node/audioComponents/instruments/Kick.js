var utils = require('../../lib/utils');
var easing = require('../../lib/easing');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var Voice = require('../voices/Triangle');
var Sine = require('../voices/Sine');
var Expander = require('../filters/StereoExpander');


//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function KickPlayer() {
    this.instances = [];
    this.markers = [];
    this.adsr = [10,70,0.4,400];
    this.adsr = [0,200,1,200];
    var d = 600;
    this.markers.push(new marker(0,1,440,this.adsr,audioClock.millisecondsToSamples(d)));
    //this.markers.push(new marker(audioClock.getBeatLength('4'),1,440,this.adsr,audioClock.millisecondsToSamples(d)));
    //this.markers.push(new marker(audioClock.getBeatLength('4')*2,1,440,this.adsr,audioClock.millisecondsToSamples(d)));
    //this.markers.push(new marker(audioClock.getBeatLength('4')*3,1,440,this.adsr,audioClock.millisecondsToSamples(d)));
    this.markers.push(new marker(audioClock.getBeatLength('16') + (audioClock.getBeatLength('16')*(tombola.range(0,14))),1,440,this.adsr,audioClock.millisecondsToSamples(500)));

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
    this.pitch = 45;
    this.pitchRatio = 10;
    this.p = 0; // panning;

    // envelope / duration //
    this.i = 0;
    this.a = 0;
    this.duration = duration || sampleRate;
    this.adsr = adsr || [3,10,0.3,89];

    this.expander = new Expander();

    // where we're stored //
    this.parentArray = parentArray;
}
proto = Kick.prototype;

//-------------------------------------------------------------------------------------------
//  KICK PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(input,level) {

    // count //
    this.i++;
    if (this.i >= this.duration) {
        this.kill();
    }

    // envelope //
    this.a = common.ADSREnvelopeII(this.i, this.duration, this.adsr);

    // voice //
    var pb =common.rampEnvelope(this.i, this.duration, this.pitch*this.pitchRatio, this.pitch, 0, 25,'quinticOut');
    var n = this.voice.process(pb);

    var boost = 1;
    var signal = [
        n * ((1 + -this.p) * (this.a * boost)),
        n * ((1 +  this.p) * (this.a * boost))
    ];


    // expander //
    //signal = this.expander.process(signal,20);


    // return with ducking //
    var ducking = 0.8;
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