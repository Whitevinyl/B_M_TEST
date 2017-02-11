var utils = require('../../lib/utils');
var easing = require('../../lib/easing');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var InharmonicSine = require('../voices/InharmonicSine');
var Saturation = require('../filters/Saturation');
var Rumble = require('../mods/WalkSmooth');
var FilterNoise = require('../voices/FilterNoise');
var Expander = require('../filters/StereoExpander');
var Boost = require('../filters/BoostComp');
var WaveShaper = require('../filters/WaveDistortion');

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
    this.transient = this.chooseTransient();

    // drive //
    this.drive = this.chooseDrive();


    console.log(this.envelope);
    console.log(this.transient);
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

    var pitch = tombola.rangeFloat(40, 150);


    // harmonics //
    var rat = 1;
    var partials = [];
    //partials.push(new common.Inharmonic(0.75,0.4));  // sub harmonic - optional?
    partials.push(new common.Inharmonic());

    for (var j=1; j<25; j++) {

        // testing different harmonic spacings here //

        var jump = tombola.rangeFloat(0.1,1.1); // taiko

        //var jump = tombola.item([0.5,1]); // square open powerful, pingy at high pitches

        //var jump = tombola.item([0.3333,0.6666,1]) + tombola.rangeFloat(-0.01,0.01); // growly, harmonic scale just audible

        //var jump = 1 + tombola.rangeFloat(-0.5,0.5); // tight ringy, clear inharmonics

        //var jump = 1.333 + tombola.rangeFloat(-0.1,0.1); // inharmonic tubey, metal pole, open ringy



        rat += jump;
        partials.push(new common.Inharmonic(rat, tombola.rangeFloat(0.6,1)));
    }


    // concentrated clusters // (reduce noise & transient for this)
    /*var cluster = 1;
    for (var j=0; j<6; j++) {
        for (var h=0; h<4; h++) {
            var ha = cluster + tombola.rangeFloat(-0.1, 0.1);
            partials.push(new common.Inharmonic(ha, tombola.rangeFloat(0.6, 1)));
        }
        cluster += tombola.rangeFloat(1.5,2);
    }*/


    // pitch drift //
    var drift = tombola.rangeFloat(0.6,0.99); // down


    // damping //
    var damping = tombola.rangeFloat(0.19,0.29); // higher = more metallic / clangy
    var dampAttack = tombola.rangeFloat(0.7,1.5);


    // thump //
    var ratio = tombola.rangeFloat(1.02, 1.04); // height of transient pitch
    var thump = tombola.range(500, 1000); // transient thump length in ms

    // rumble //
    var rumbleGain = 0.1;
    if (tombola.percent(5)) {
        rumbleGain = tombola.rangeFloat(0.05,0.25);
        //rumbleGain = tombola.rangeFloat(0.5,0.85); // noisy, good for low freq noise drums
        //rumbleGain = tombola.rangeFloat(0.01,0.05); // clean
    }
    //rumbleGain = 0.04;

    // testing //
    /*pitch = 180;
    drift = 0.84;
    damping = 0.2;
    dampAttack = 1.5;
    ratio = 1.04;
    thump = 1000;*/

    return {
        type: InharmonicSine,
        partials: partials,
        pitch: pitch,
        drift: drift,
        rumblePitch: pitch * 25,
        rumbleGain: rumbleGain,
        damping: damping,
        dampAttack: dampAttack,
        ratio: ratio,
        thump: thump
    };
};


// ENVELOPE //
proto.chooseEnvelope = function() {

    var env = [];
    var duration = 0;

    env.push(new common.EnvelopePoint(tombola.range(1,4), 1, 'In'));
    env.push(new common.EnvelopePoint(tombola.range(150,300), tombola.rangeFloat(0.8,1), 'In'));
    env.push(new common.EnvelopePoint(tombola.range(850,1300), 0, 'Out'));

    var envString = '';
    for (var i=0; i<env.length; i++) {
        duration += env[i].time;
        envString += audioClock.samplesToMilliseconds(env[i].time) + ' ';
    }


    return {
        duration: audioClock.millisecondsToSamples(duration),
        envelope: env,
        envelopeTimes: envString,
        curves: tombola.item(['quadratic','cubic','quartic','quintic'])
    };
};



// TRANSIENT //
proto.chooseTransient = function() {
    var env = [];
    var envStyle = tombola.range(0,3);

    switch (envStyle) {

        case 0: // short sustain at 1
            env.push( new common.EnvelopePoint(tombola.rangeFloat(1,3),1,'In') );
            env.push( new common.EnvelopePoint(2,1,'Out') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(4,6),0,'Out') );
            break;

        case 1: // ~ in-out curve
            env.push( new common.EnvelopePoint(tombola.rangeFloat(1,3),1,'In') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(5,9),0,'InOut') );
            break;


        case 2: // outward bow curve
            env.push( new common.EnvelopePoint(tombola.rangeFloat(1,3),1,'In') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(4,6),0,'In') );
            break;

        case 3: // flam
            env.push( new common.EnvelopePoint(tombola.rangeFloat(1,3),0.5,'In') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(4,6),0,'Out') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(1,3),1,'In') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(4,6),0,'Out') );
            break;

    }
    return {
        type: FilterNoise,
        envelope: env,
        pitch: this.voice.pitch/333
    };
};



// DRIVE //
proto.chooseDrive = function() {

    return {
        type: Saturation,
        threshold: tombola.rangeFloat(0.7,0.8),
        mix: tombola.rangeFloat(0.4,0.7)
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
            this.instances.push( new BigDrum(this.instances,this.envelope,this.voice,this.transient,this.drive));
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

function BigDrum(parentArray,envelope,voice,transient) {

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
    this.dampAttack = voice.dampAttack;
    this.pitchRatio = voice.ratio;
    this.thump = voice.thump;
    this.drift = voice.drift;
    this.p = 0; // panning;


    // transient //
    this.transient = new transient.type();
    this.transientEnvelope = transient.envelope;
    this.transientPitch = transient.pitch;

    // rumble //
    this.rumble = new Rumble();
    this.rumblePitch = voice.rumblePitch;
    this.rumbleGain = voice.rumbleGain;


    // expander //
    this.expander = new Expander();

    this.distortion = WaveShaper;


    // boost //
    this.boost = new Boost();
    this.boost.setParameter(0,0.3);
    this.boost.setParameter(2,0.26);




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
    var transEnv = common.multiEnvelope(this.i, this.duration, this.transientEnvelope, this.curves);
    transEnv *= 0.1; // adjust //
    var bodyEnv = 1;

    var envs = [transEnv,bodyEnv];
    var te = common.sumEnvelopes(envs,0);
    var ae = common.sumEnvelopes(envs,1);


    // transient // 0.3
    var trans = this.transient.process(this.transientPitch,1) * te;

    // voice //
    var pb = common.rampEnvelopeII(this.i, this.duration, this.pitch * this.pitchRatio, this.pitch, 0, this.thump, 'quinticOut');
    var da = common.rampEnvelopeII(this.i, this.duration, 1.01, this.damping, 0, this.thump * 0.7, 'quinticOut');
    var pd = common.rampEnvelope(this.i, this.duration, 1, this.drift, 0, 100,'linearOut');
    var body = this.voice.process(pb * pd, this.partials,da);



    // rumble //
    body *= (1 - this.rumbleGain);
    var ra = common.rampEnvelopeII(this.i, this.duration, this.rumblePitch * 2, this.rumblePitch, 0, this.thump * 0.3, 'quinticOut');
    var rumble = this.rumble.process(ra,10) * this.rumbleGain;

    // combined gain of body & rumble //
    var bodyRumble = (body + rumble) * ae;


    var signal = [
        (trans + bodyRumble) * ((1 + -this.p) * a),
        (trans + bodyRumble) * ((1 +  this.p) * a)
    ];


    // expander //
    signal = this.expander.process(signal,15);


    // boost //
    signal = this.boost.process(signal);


    // waveshape //
    //signal = this.distortion(signal,0.7,5,1);

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