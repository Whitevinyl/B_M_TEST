var utils = require('../../lib/utils');
var easing = require('../../lib/easing');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var InharmonicSine = require('../voices/InharmonicSine');

// Procedurally generates improbable large acoustic drums

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------

function BigDrumPlayer() {
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

}
var proto = BigDrumPlayer.prototype;

//-------------------------------------------------------------------------------------------
//  RANDOMISE SETTINGS
//-------------------------------------------------------------------------------------------

// VOICE //
proto.chooseVoice = function() {

    var pitch = tombola.rangeFloat(50, 60);


    // harmonics //
    var rat = 1;
    var partials = [new common.Inharmonic()];
    for (var j=1; j<12; j++) {
        rat += tombola.rangeFloat(0.1,2);
        partials.push(new common.Inharmonic(rat, tombola.rangeFloat(0.5,0.9)));
    }


    // pitch drift //
    var drift = 0;
    if (tombola.percent(5)) {
        drift = tombola.rangeFloat(0,1.1); // up
    }
    if (tombola.percent(50)) {
        drift = tombola.rangeFloat(0.7,0); // down
    }

    return {
        type: InharmonicSine,
        pitch: pitch,
        partials: partials,
        damping: tombola.rangeFloat(0.25,0.45),
        ratio: tombola.rangeFloat(8, 30), // height of transient pitch
        thump: tombola.range(22, 39), // transient thump length in ms
    };
};


// ENVELOPE //
proto.chooseEnvelope = function() {

    var env = [];
    var duration = 0;

    env.push(new common.EnvelopePoint(tombola.range(1,6), 1, 'In'));
    env.push(new common.EnvelopePoint(tombola.range(150,600), 0, 'InOut'));

    for (var i=0; i<env.length; i++) {
        duration += env[i].time;
    }

    return {
        duration: audioClock.millisecondsToSamples(duration),
        envelope: env,
        curves: tombola.item(['quadratic','cubic','quartic','quintic'])
    };
};


// DRIVE //
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
            this.instances.push( new BigDrum(this.instances,this.envelope,this.voice,this.drive));
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
//  BIG DRUM INIT
//-------------------------------------------------------------------------------------------

function BigDrum(parentArray,envelope,voice,drive) {

    // where we're stored //
    this.parentArray = parentArray;

    // envelope / duration //
    this.i = 0;
    this.duration = envelope.duration;
    this.envelope = envelope.envelope;
    this.curves = envelope.curves;


    // voice //
    this.voice = new voice.type();
    this.pitch = voice.pitch;
    this.partials = voice.partials;
    this.damping = voice.damping;
    this.pitchRatio = voice.ratio;
    this.thump = voice.thump;
    this.drift = voice.drift;
    this.p = 0; // panning;


}
proto = BigDrum.prototype;


//-------------------------------------------------------------------------------------------
//  BIG DRUM PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(input,level) {

    // count //
    this.i++;
    if (this.i >= this.duration) {
        this.kill();
    }


    // envelope //
    var a = common.multiEnvelope(this.i, this.duration, this.envelope, this.curves);


    // voice //
    var pb = common.rampEnvelopeII(this.i, this.duration, this.pitch * this.pitchRatio, this.pitch, 0, this.thump, 'quinticOut');
    var pd = common.rampEnvelope(this.i, this.duration, 1, this.drift, 0, 100,'linearOut');
    var n = this.voice.process(pb * pd, this.partials,this.damping);



    var signal = [
        n * ((1 + -this.p) * a),
        n * ((1 +  this.p) * a)
    ];


    // return with ducking //
    var ducking = 0.8;
    return [
        (input[0] * (1-(a * ducking))) + signal[0],
        (input[1] * (1-(a * ducking))) + signal[1]
    ];
};

//-------------------------------------------------------------------------------------------
//  BIG DRUM KILL
//-------------------------------------------------------------------------------------------

// remove from parent object //
proto.kill = function() {
    var index = this.parentArray.indexOf(this);
    if (index > -1) {
        this.parentArray.splice(index, 1);
    }
};



module.exports = BigDrumPlayer;