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


// Procedurally generates metallic percussion

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------

function MetallicPlayer() {
    this.instances = [];
    this.markers = [];

    // voice //
    this.voice = this.chooseVoice();

    // envelope & duration //
    this.envelope = this.chooseEnvelope();

    // transient //
    this.transient = this.chooseTransient();



    console.log(this.envelope);
    console.log(this.transient);
    console.log(this.voice);

    this.markers.push(new marker(0,1,440,this.adsr,this.envelope.duration));

}
var proto = MetallicPlayer.prototype;

//-------------------------------------------------------------------------------------------
//  RANDOMISE SETTINGS
//-------------------------------------------------------------------------------------------

// VOICE //
proto.chooseVoice = function() {

    var pitch = tombola.rangeFloat(70, 350);

    //pitch = 185;
    pitch = 250;


    // harmonics //
    var rat = 1;
    var partials = [];
    partials.push(new common.Inharmonic());

    /*partials.push(new common.Inharmonic(0.76,0.9));
    partials.push(new common.Inharmonic(0.44,0.7));
    partials.push(new common.Inharmonic(0.22,0.6));

    partials.push(new common.Inharmonic(1.14,0.6));
    partials.push(new common.Inharmonic(1.30,0.4));*/

    var jump = tombola.rangeFloat(0.7,1.7);
    jump = 1;
    //jump = 0.86;

    /*var cluster = 1;
    for (var h=0; h<3; h++) {

        for (var j = 1; j < 6; j++) {

            // testing different harmonic spacings here //

            //var jump = tombola.rangeFloat(0.1,1.1);
            //var jump = tombola.item([0.5,1]); // square open powerful, pingy at high pitches
            //var jump = tombola.item([0.05,1,1.05]); // square open powerful, pingy at high pitches
            //var jump = 1.333 + tombola.rangeFloat(-0.2,0.2); // inharmonic tubey, metal pole, open ringy

            //var jump = 1.55;

            rat += jump;

            rat = cluster + tombola.rangeFloat(0.91, 1.1) - 1;
            partials.push(new common.Inharmonic(rat, tombola.rangeFloat(0.6, 1)));
        }
        cluster += tombola.rangeFloat(0.5,1);
    }*/

    for (var j = 0; j < 10; j++) {

        jump += 1 + tombola.rangeFloat(-0.2, 0.2);
        partials.push(new common.Inharmonic(jump, tombola.rangeFloat(0.4, 0.7)));
    }


    // pitch drift //
    var drift = tombola.rangeFloat(0.6,0.99); // down
    drift = 0;


    // damping //
    var damping = tombola.rangeFloat(0.3,0.9); // higher = more metallic / clangy
    var dampAttack = tombola.rangeFloat(1.5,3);
    //damping = 0.25;

    // thump //
    var ratio = tombola.rangeFloat(1.01, 1.04); // height of transient pitch
    var thump = tombola.range(300, 400); // transient thump length in ms

    // rumble //
    var rumbleGain = 0.02;
    rumbleGain = 0;

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
    env.push(new common.EnvelopePoint(tombola.range(800,900), 0, 'Out'));

    var envString = '';
    for (var i=0; i<env.length; i++) {
        duration += env[i].time;
        envString += audioClock.samplesToMilliseconds(env[i].time) + ' ';
    }

    var dampEnv = this.generateDampEnvelope(duration);

    return {
        duration: audioClock.millisecondsToSamples(duration),
        envelope: env,
        envelopeTimes: envString,
        dampEnvelope: dampEnv,
        curves: tombola.item(['quadratic','cubic','quartic','quintic'])
    };
};


proto.generateDampEnvelope = function(d) {
    var types = ['hardInUp', 'hardInDown', 'hardOutUp', 'hardOutDown', 'hardInOutUp', 'hardInOutDown'];

    var env = [];
    var time;
    var minTime = 50;
    var maxTime = 200;

    while (d > 0) {

        // set or randomise time //
        time = tombola.range(minTime,maxTime);

        // create & add a shape //
        env = common.addShape(env, common.getShape(time,tombola.item(types),tombola.rangeFloat(0.85,1)));
        d -= time;
    }

    return env;
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
            this.instances.push( new Metallic(this.instances,this.envelope,this.voice,this.transient));
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

function Metallic(parentArray,envelope,voice,transient) {

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
    this.partials = JSON.parse(JSON.stringify(voice.partials));
    this.rootPartials = JSON.parse(JSON.stringify(voice.partials));
    this.damping = voice.damping;
    this.dampAttack = voice.dampAttack;
    this.dampEnvelope = envelope.dampEnvelope;
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



    // boost //
    this.boost = new Boost();
    this.boost.setParameter(0,0.3);
    this.boost.setParameter(2,0.26);




}
proto = Metallic.prototype;


//-------------------------------------------------------------------------------------------
//  BIG DRUM PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(input,level) {

    // count //
    this.i++;
    if (this.i >= this.duration) {
        this.kill();
    }


    // mess with partials //
    var l = this.partials.length;
    var movement = 3;
    var range = 5;
    var up = 1 + range;
    var down = 1 / up;
    for (var i=0; i<l; i++) {
        this.partials[i].ratio += tombola.rangeFloat(-movement,movement);
        this.partials[i].ratio = utils.valueInRange(this.partials[i].ratio,this.rootPartials[i].ratio * down,this.rootPartials[i].ratio * up);
    }


    // envelope //
    var a = common.multiEnvelope(this.i, this.duration, this.envelope, this.curves);
    var transEnv = common.multiEnvelope(this.i, this.duration, this.transientEnvelope, this.curves);
    var dampEnv = common.multiEnvelope(this.i, this.duration, this.dampEnvelope, this.curves);
    transEnv *= 0.1; // adjust //
    var bodyEnv = 1;
    transEnv = 0;

    var envs = [transEnv,bodyEnv];
    var te = common.sumEnvelopes(envs,0);
    var ae = common.sumEnvelopes(envs,1);


    // transient // 0.3
    var trans = this.transient.process(this.transientPitch,1) * te;

    // voice //
    var pb = common.rampEnvelopeII(this.i, this.duration, this.pitch * this.pitchRatio, this.pitch, 0, this.thump, 'quinticOut');
    var da = common.rampEnvelopeII(this.i, this.duration, 1.01, this.damping, 0, this.thump * 0.7, 'quinticOut');
    var pd = common.rampEnvelope(this.i, this.duration, 1, this.drift, 0, 100,'linearOut');
    var body = this.voice.process(pb * pd, this.partials,1 * dampEnv);



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
    //signal = this.expander.process(signal,15);


    // boost //
    //signal = this.boost.process(signal);


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



module.exports = MetallicPlayer;
