var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var FMNoise = require('../voices/FMNoise');
var Expander = require('../filters/StereoExpander');
var WaveShaper = require('../filters/WaveDistortion');
var Saturation = require('../filters/Saturation');

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

    var detune = [tombola.rangeFloat(0.1,12),tombola.rangeFloat(0.1,12),tombola.rangeFloat(0.1,12)];
    var volume = [tombola.rangeFloat(0.15,1),tombola.rangeFloat(0.15,1),tombola.rangeFloat(0.15,1)];

    return {
        voice: FMNoise,
        pitch: tombola.rangeFloat(200,600),
        detune: detune,
        volume: volume,
        hp: tombola.rangeFloat(2100,7000)
    };
};



proto.chooseEnvelope = function() {

    var oscEnv = [];

    var envStyle = tombola.range(0,4);
    switch (envStyle) {

        case 0:
            // straight decay //
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(25,55), 0, 'Out'));
            break;

        case 1:
            // shaker //
            oscEnv.push(new common.EnvelopePoint(tombola.range(18,30), 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(5,10), 0, 'Out'));
            break;

        case 2:
            // slight hold & decay //
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(5, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(25,55), 0, 'Out'));
            break;

        case 3:
            // longer decay //
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(55,70), 0, 'Out'));
            break;

        case 4:
            // double Attack //
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(5,15), 0, 'Out'));
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(25,55), 0, 'Out'));
            break;
    }

    var duration = 0;
    for (var i=0; i<oscEnv.length; i++) {
        duration += oscEnv[i].time;
    }



    var fmEnv = [];


    return {
        duration: duration,
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
    this.duration = envelope.duration;
    this.oscEnvelope = envelope.oscEnvelope;
    this.fmEnvelope = envelope.fmEnvelope;
    this.curves = envelope.curves;


    // voice //
    this.voice = new voice.voice();
    this.pitch = voice.pitch;
    this.detune = voice.detune;
    this.volume = voice.volume;
    this.p = 0;

    // filter //
    this.filter = new Biquad.stereo();
    this.hp = voice.hp;

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


    // envelope //
    var a = common.multiEnvelope(this.i, this.duration, this.oscEnvelope, this.curves);
    var fmEnv = common.multiEnvelope(this.i, this.duration, this.fmEnvelope, this.curves);


    // voice //
    var noise = this.voice.process(this.pitch,this.detune[0],this.detune[1],this.detune[2],this.volume[0],this.volume[1],this.volume[2]) * a;

    // assemble //
    var signal = [
        noise * (1 + -this.p),
        noise * (1 +  this.p)
    ];

    // high pass //
    signal = this.filter.process(signal,'highpass',this.hp, 2, -1);


    // drive //
    //signal = WaveShaper(signal,0.1,6,1);
    signal = Saturation(signal,0.6,1);

    // clip any noise spikes //
    signal = common.clipStereo(signal,1);

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