var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var FMNoise = require('../voices/FMNoise');
var Expander = require('../filters/StereoExpander');
var WaveShaper = require('../filters/WaveDistortion');

var Biquad = require('../filters/Biquad');

// Procedurally generates synth hi-hats, clicks, shakers & other percussive noise.
// Individual hat hits inherit their settings from the player, but can also adapt their
// settings & effects separate from all other hits.

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------

function HatPlayer() {
    this.instances = [];
    this.markers = [];

    // voice //
    this.voice = this.chooseVoice();

    // envelope & duration //
    this.envelope = this.chooseEnvelope();

    // drive //
    this.drive = this.chooseDrive();


    console.log(this.envelope);
    console.log(this.voice);
    console.log(this.drive);

    this.markers.push(new marker(0,1,440,this.adsr,this.envelope.duration));
    //this.markers.push(new marker(audioClock.getBeatLength('16') + (audioClock.getBeatLength('16')*(tombola.range(0,14))),1,440,this.adsr,this.envelope.duration));

}
var proto = HatPlayer.prototype;


//-------------------------------------------------------------------------------------------
//  RANDOMISE SETTINGS
//-------------------------------------------------------------------------------------------

proto.chooseVoice = function() {


    return {
        voice: FMNoise,
        pitch: 261.63,
        hp: 0
    };
};



proto.chooseEnvelope = function() {

    var oscEnv = [];
    var fmEnv = [];
    var duration = 0;

    return {
        duration: audioClock.millisecondsToSamples(duration),
        oscEnvelope: oscEnv,
        fmEnvelope: fmEnv,
        curves: tombola.item(['linear','quadratic','cubic','quartic','quintic'])
    };
};



proto.chooseDrive = function() {


    return {

    };
};

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
            this.instances = []; // clear for mono
            this.instances.push( new Hat(this.instances,this.envelope,this.voice,this.drive));
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
//  HAT INIT
//-------------------------------------------------------------------------------------------

function Hat(parentArray,envelope,voice,drive) {

    // where we're stored //
    this.parentArray = parentArray;

    // envelope / duration //
    this.i = 0;
    this.a = 0;
    this.duration = envelope.duration;
    this.oscEnvelope = envelope.oscEnvelope;
    this.fmEnvelope = envelope.fmEnvelope;
    this.curves = envelope.curves;


    // voice //
    this.voice = new voice.voice();
    this.pitch = voice.pitch;

}
proto = Hat.prototype;


//-------------------------------------------------------------------------------------------
//  HAT PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(input,level) {

    // count //
    this.i++;
    if (this.i >= this.duration) {
        this.kill();
    }

    var a = common.multiEnvelope(this.i, this.duration, this.oscEnvelope, this.curves);
    var fmEnv = common.multiEnvelope(this.i, this.duration, this.fmEnvelope, this.curves);


    var ducking = 0;
    return [
        (input[0] * (1-(a * ducking))) + (signal[0] * level),
        (input[1] * (1-(a * ducking))) + (signal[1] * level)
    ];
};


//-------------------------------------------------------------------------------------------
//  HAT KILL
//-------------------------------------------------------------------------------------------

// remove from parent object //
proto.kill = function() {
    var index = this.parentArray.indexOf(this);
    if (index > -1) {
        this.parentArray.splice(index, 1);
    }
};



module.exports = HatPlayer;