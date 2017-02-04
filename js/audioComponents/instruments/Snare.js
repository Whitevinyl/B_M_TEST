var utils = require('../../lib/utils');
var easing = require('../../lib/easing');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');

var Sine = require('../voices/Sine');
var SineSquare = require('../voices/SineSquare');
var SineTriangle = require('../voices/SineTriangle');
var Roar = require('../voices/RoarNoise');
var Brown = require('../voices/BrownNoise');
var Static = require('../voices/StaticNoise');
var Crackle = require('../voices/CrackleNoise');
var Pink = require('../voices/PinkNoise');
var Rumble = require('../voices/RumbleNoise');
var White = require('../voices/WhiteNoise');
var BrownWhite = require('../voices/FilterNoise');
var LoudNoise = require('../voices/LoudNoise');

var drive = require('../filters/FoldBackII');
var drive2 = require('../filters/Erode');
var Biquad = require('../filters/Biquad');
var EQ = require('../filters/EQ');
var LowPass = require('../filters/LowPass');

// Procedurally generates synth snares. Individual snare hits inherit their settings from
// the player, but can also adapt their settings & effects separate from all other hits.

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function SnarePlayer() {
    this.instances = [];
    this.markers = [];

    // main envelope & duration //
    this.envelope = this.chooseEnvelope();

    // voice //
    this.voice = this.chooseVoice();

    // noise //
    this.noise = this.chooseNoise();

    // transient //
    this.transient = this.chooseTransient();

    // drive //
    this.drive = this.chooseDrive();

    // filter //
    this.filter = this.chooseFilter();

    console.log('// SNARE //');
    console.log(this.transient);
    console.log(this.filter);
    console.log(this.envelope);
    console.log(this.noise);
    console.log(this.voice);
    console.log(this.drive);
    this.maxPeak = 0;

    //this.markers.push(new marker(0,1,440,this.adsr,this.envelope.duration));
    this.markers.push(new marker(audioClock.getBeatLength('4'),1,440,this.adsr,this.envelope.duration));
    this.markers.push(new marker(audioClock.getBeatLength('D2'),1,440,this.adsr,this.envelope.duration));
}
var proto = SnarePlayer.prototype;


//-------------------------------------------------------------------------------------------
//  RANDOMISE SETTINGS
//-------------------------------------------------------------------------------------------


// VOICE //
proto.chooseVoice = function() {

    var type = Sine;
    var pitch = tombola.rangeFloat(170, 330);


    // body envelope //
    var d = audioClock.samplesToMilliseconds(this.envelope.duration);
    var env = [];

    var depth = tombola.rangeFloat(0,1);
    if (tombola.percent(15)) {
        depth = tombola.rangeFloat(0.6,1);
    }

    var envStyle = tombola.range(0,4);
    switch (envStyle) {

        case 0:
            env.push(new common.EnvelopePoint(0, depth, 'In'));
            env.push(new common.EnvelopePoint(12, 0.6, 'Out'));
            env.push(new common.EnvelopePoint(10, 0.9, 'In'));
            env.push(new common.EnvelopePoint(d * 0.28, 0, 'Out'));
            break;

        case 1:
            env.push(new common.EnvelopePoint(0, depth, 'In'));
            env.push(new common.EnvelopePoint(d * 0.05, 1, 'Out'));
            env.push(new common.EnvelopePoint(d * 0.35, 0, 'InOut'));
            break;

        case 2:
            env.push(new common.EnvelopePoint(0, depth, 'In'));
            env.push(new common.EnvelopePoint(d * 0.1, 1, 'InOut'));
            env.push(new common.EnvelopePoint(d * 0.4, 0, 'InOut'));
            break;

        case 3:
            env.push(new common.EnvelopePoint(10, 1, 'In'));
            env.push(new common.EnvelopePoint(d * 0.4, 0, 'In'));
            break;

        case 4:
            env.push(new common.EnvelopePoint(12, 1, 'In'));
            env.push(new common.EnvelopePoint(d * 0.6, 0, 'Out'));
            break;

    }


    // create harmonics //
    var harmonics = [];
    var n = tombola.range(4,6);
    for (var i=0; i<n; i++) {
        var h = {
            ratio: utils.intervalToRatio(tombola.rangeFloat(-3,5)),
            gain: tombola.rangeFloat(0.6,0.8)
        };
        harmonics.push(h);
    }


    // generate object //
    return {
        type: type,
        pitch: pitch,
        ratio: tombola.rangeFloat(5, 10), // height of transient pitch
        thump: tombola.range(23, 30), // transient pitch decay milliseconds
        drift: tombola.rangeFloat(0.85,1.02), // body pitch drift
        bodyLevel: tombola.rangeFloat(0.65,1), // volume of body
        envelope: env,
        harmonics: harmonics
    };
};



// NOISE //
proto.chooseNoise = function() {

    var d = audioClock.samplesToMilliseconds(this.envelope.duration);
    var env = [];

    var envStyle = tombola.range(0,4);
    var depth, depth2;
    var attack = tombola.rangeFloat(0.2,1);

    switch (envStyle) {

        case 0:
            depth = tombola.rangeFloat(0,0.4);
            depth2 = tombola.rangeFloat(0.8,1);
            env.push( new common.EnvelopePoint(0,attack,'In') );
            env.push( new common.EnvelopePoint(d*0.1,depth,'InOut') );
            env.push( new common.EnvelopePoint(d*0.2,depth2,'InOut') );
            env.push( new common.EnvelopePoint(d*0.6,0,'InOut') );
            break;

        case 1:
            depth = tombola.rangeFloat(0,0.25);
            depth2 = tombola.rangeFloat(0.8,1);
            env.push( new common.EnvelopePoint(0,attack,'In') );
            env.push( new common.EnvelopePoint(10,depth,'InOut') );
            env.push( new common.EnvelopePoint(d*0.3,depth2,'InOut') );
            env.push( new common.EnvelopePoint(d*0.55,0,'InOut') );
            break;

        case 2:
            depth = tombola.rangeFloat(0,0.15);
            depth2 = tombola.rangeFloat(0.8,1);
            env.push( new common.EnvelopePoint(0,attack,'In') );
            env.push( new common.EnvelopePoint(d*0.15,depth,'Out') );
            env.push( new common.EnvelopePoint(0,depth2,'InOut') );
            env.push( new common.EnvelopePoint(d*0.15,depth,'Out') );
            env.push( new common.EnvelopePoint(d*0.2,depth2,'InOut') );
            env.push( new common.EnvelopePoint(d*0.5,0,'InOut') );
            break;

        case 3:
            depth = tombola.rangeFloat(0,0.15);
            depth2 = tombola.rangeFloat(0.8,1);
            env.push( new common.EnvelopePoint(0,attack,'In') );
            env.push( new common.EnvelopePoint(d*0.1,depth,'Out') );
            env.push( new common.EnvelopePoint(0,depth2,'InOut') );
            env.push( new common.EnvelopePoint(d*0.1,depth,'Out') );
            env.push( new common.EnvelopePoint(0,depth2,'InOut') );
            env.push( new common.EnvelopePoint(d*0.1,depth,'Out') );
            env.push( new common.EnvelopePoint(0,depth2,'InOut') );
            env.push( new common.EnvelopePoint(d*0.7,0,'InOut') );
            break;

        case 4:
            env = this.generateNoiseEnvelope(d);
            break;
    }



    var type = tombola.item([BrownWhite,Roar,White,Pink,Static,Rumble]);
    //type = BrownWhite;

    return {
        type: type,
        envelope: env,
        threshold1: tombola.rangeFloat(5,9.5),
        threshold2: tombola.rangeFloat(5,9.5)
    };

};


proto.generateNoiseEnvelope = function(d) {
    var types = ['hardInUp', 'hardInDown', 'hardOutUp', 'hardOutDown', 'hardInOutUp', 'hardInOutDown'];

    var env = [];
    var time;
    var minTime = 5;
    var maxTime = 70;

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

    var envStyle = tombola.range(0,4);
    var depth;


    switch (envStyle) {

        case 0: // short sustain at 1
            env.push( new common.EnvelopePoint(0,1,'In') );
            env.push( new common.EnvelopePoint(2,1,'Out') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(3,5),0,'Out') );
            break;

        case 1: // ~ in-out curve
            env.push( new common.EnvelopePoint(0,1,'In') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(5,10),0,'InOut') );
            break;

        case 2: // short ramp part way down before decay
            depth = tombola.rangeFloat(0.6,0.9);
            env.push( new common.EnvelopePoint(0,1,'In') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(2,4),depth,'In') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(2,4),0,'Out') );
            break;

        case 3: // outward bow curve
            env.push( new common.EnvelopePoint(0,1,'In') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(3,5),0,'In') );
            break;

        case 4: // variable sustain at 1
            env.push( new common.EnvelopePoint(0,1,'In') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(3,10),1,'InOut') );
            env.push( new common.EnvelopePoint(tombola.rangeFloat(5,8),0,'Out') );
            break;
    }

    return {
        type: LoudNoise,
        envelope: env
    };

};


// ENVELOPE //
proto.chooseEnvelope = function() {

    var adsr = [0,tombola.range(20,90),tombola.rangeFloat(0.8,0.98),tombola.range(80,250)];
    var duration = adsr[0] + adsr[1] + adsr[3] + 10*0.2;

    return {
        curves: tombola.item(['linear','quadratic','cubic','quartic','quintic']),
        adsr:   adsr,
        duration: audioClock.millisecondsToSamples(duration)
    };
};



// DRIVE //
proto.chooseDrive = function() {
    var attack = tombola.range(0,70);

    // generate object //
    return {
        threshold: tombola.rangeFloat(0.1,0.6),
        power: tombola.range(0,8),
        envelope: [attack,0,1,tombola.range(0,100-attack)],
        mix: tombola.rangeFloat(0,0.5)
    };
};



// FILTERING //
proto.chooseFilter = function() {

    var co1,co2;

    co1 = tombola.rangeFloat(8000,12000);
    co2 = co1;
    if (tombola.percent(40)) {
        co2 = tombola.rangeFloat(8000,12000);
    }
    if (tombola.percent(20)) {
        if (tombola.chance(80)) {
            co2 = tombola.rangeFloat(2000,5000);
        } else {
            co1 = tombola.rangeFloat(2000,5000);
        }
    }

    return {
        highpass: tombola.rangeFloat(100,130),
        peak: this.voice.pitch * tombola.rangeFloat(1.3,1.5),
        cutoff1: co1,
        cutoff2: co2
    }
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
            this.instances.push( new Snare(this.instances,this.envelope,this.voice,this.noise,this.transient,this.drive,this.filter));
        }
    }

    // process any active instances //
    l = this.instances.length-1;
    for (i=l; i>=0; i--) {
        this.maxPeak = Math.max(this.maxPeak,this.instances[i].maxPeak);
        signal = this.instances[i].process(signal,level);
    }


    return signal;
};


//-------------------------------------------------------------------------------------------
//  SNARE INIT
//-------------------------------------------------------------------------------------------

function Snare(parentArray,envelope,voice,noise,transient,drive,filter) {

    // where we're stored //
    this.parentArray = parentArray;

    // envelope / duration //
    this.i = 0;
    this.a = 0;
    this.duration = envelope.duration;
    this.adsr = envelope.adsr;
    this.curves = envelope.curves;


    // voice //
    this.voice = new voice.type();
    this.pitch = voice.pitch;
    this.pitchRatio = voice.ratio;
    this.thump = voice.thump;
    this.drift = voice.drift;
    this.oscEnvelope = voice.envelope;
    this.bodyLevel = voice.bodyLevel;
    this.p = 0; // panning;

    this.harmonics = [];
    var n = voice.harmonics.length;
    for (var i=0; i<n; i++) {
        var h = {
            voice: new voice.type(),
            pitch: voice.pitch * voice.harmonics[i].ratio,
            gain: voice.harmonics[i].gain
        };
        this.harmonics.push(h);
    }


    // noise //
    this.noiseL = new NoiseWrapper(noise.type);
    this.noiseR = new NoiseWrapper(noise.type);
    this.noiseThresh1 = noise.threshold1;
    this.noiseThresh2 = noise.threshold2;
    this.noiseEnvelope = noise.envelope;


    // transient //
    this.transient = new transient.type();
    this.transientEnvelope = transient.envelope;


    // drive //
    this.driveAdsr = drive.envelope;
    this.threshold = drive.threshold;
    this.power = drive.power;
    this.driveMix = drive.mix;


    // filter //
    this.lp = new LowPass.stereo();
    this.hp = new Biquad.stereo();
    this.hpFreq = filter.highpass;
    this.filterPeak = filter.peak;
    this.eq = new EQ.stereo();
    this.cutoff1 = filter.cutoff1;
    this.cutoff2 = filter.cutoff2;

    this.maxPeak = 0;
}
proto = Snare.prototype;


//-------------------------------------------------------------------------------------------
//  SNARE PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(input,level) {
    level = utils.arg(level,1);

    // count //
    this.i++;
    if (this.i >= this.duration) {
        this.kill();
    }


    // main envelope //
    this.a = common.ADSREnvelopeII(this.i, this.duration, this.adsr, this.curves);


    // layer envelopes //
    var transEnv = common.multiEnvelope(this.i, this.duration, this.transientEnvelope, this.curves);
    var noiseEnv = common.multiEnvelope(this.i, this.duration, this.noiseEnvelope, this.curves);
    var oscEnv = common.multiEnvelope(this.i, this.duration, this.oscEnvelope, this.curves);

    // duck & sum envelopes //
    oscEnv *= (1 - (transEnv*0.4));
    oscEnv *= (1 - (noiseEnv*0.1));

    var envs = [transEnv,noiseEnv,oscEnv];
    var te = sumEnvelopes(envs,0);
    var ne = sumEnvelopes(envs,1);
    var oe = sumEnvelopes(envs,2);

    //console.log(envs);
    //console.log('t: '+te+' n: '+ne+' o: '+oe);
    transEnv = te;
    noiseEnv = ne;
    oscEnv   = oe;

    // transient //
    var trans = this.transient.process(0.75,1) * transEnv;

    // noise //
    var nt = common.rampEnvelope(this.i, this.duration, this.noiseThresh1, this.noiseThresh2, 0, 75, 'linearOut');
    var noiseL = this.noiseL.process(nt,10000,1) * noiseEnv;
    var noiseR = this.noiseR.process(nt,10000,1) * noiseEnv;
    //noiseR = noiseL;

    // body //
    var pb = common.rampEnvelopeII(this.i, this.duration, this.pitch * this.pitchRatio, this.pitch, 0, this.thump, 'quinticOut');
    var pd = common.rampEnvelope(this.i, this.duration, 1, this.drift, 0, 75, 'linearOut');
    var osc = this.voice.process(pb * pd) * oscEnv;
    osc *= this.bodyLevel;

    // harmonics //
    var n = this.harmonics.length;
    var harm = 0;
    var harmGain = 0;
    for (var i=0; i<n; i++) {
        var h = this.harmonics[i];
        harm += (h.voice.process(h.pitch) * h.gain);
        harmGain += h.gain;
    }

    //console.log(harm);

    harm /= (n-1);
    harm *= oscEnv;
    harm *= this.bodyLevel;
    osc *= (1-harm);

    //console.log(harm);

    // internal ducking to blend the transient, body & noise layers //
    /*var transDuck = (transEnv * 1);
    var noiseDuck = (noiseEnv * 1);
    noiseL *= (1 - transDuck);
    noiseR *= (1 - transDuck);
    osc    *= (1 - transDuck);
    osc    *= (1 - noiseDuck);*/



    // assemble signal //
    var signal = [
        (harm + osc + noiseL + trans) * (1 + -this.p),
        (harm + osc + noiseR + trans) * (1 +  this.p)
    ];


    // drive //
    /*var da = common.ADSREnvelope(this.i, this.duration, this.driveAdsr, this.curves);
    signal = drive(signal,this.threshold,this.power,da * this.driveMix);*/


    // filter //
    var cutoff = common.rampEnvelope(this.i, this.duration, this.cutoff1, this.cutoff2, 0, 50, 'linearOut');

    signal = this.hp.process(signal,'highpass',90,0,0);
    signal = this.eq.process(signal, 60,-5, 1050,7,-1, 8000,-1);
    signal = this.lp.process(signal,cutoff,1);




    // return with ducking & filter compensation //
    var amp = this.a * level;
    var ducking = 0.8 * amp;


    signal = common.multiply(signal,amp);


    // clip any noise spikes //
    signal = common.clipStereo(signal,1);

    this.maxPeak = Math.max(Math.abs(signal[0]),Math.abs(signal[1]));

    return [
        (input[0] * (1-ducking)) + signal[0],
        (input[1] * (1-ducking)) + signal[1]
    ];
};


function sumEnvelopes(envelopes,index) {

    var total = 0;
    var m = envelopes[index];

    var l = envelopes.length;
    for (var i=0; i<l; i++) {
        total += envelopes[i];
    }

    if (total > 1) {
        m = envelopes[index]/total;
    }

    return m;
}


//-------------------------------------------------------------------------------------------
//  SNARE KILL
//-------------------------------------------------------------------------------------------

// remove from parent object //
proto.kill = function() {
    var index = this.parentArray.indexOf(this);
    if (index > -1) {
        this.parentArray.splice(index, 1);
    }
};


//-------------------------------------------------------------------------------------------
//  NOISE WRAPPER
//-------------------------------------------------------------------------------------------


function NoiseWrapper(type) {
    this.noise = new type();
    this.type = type;
}

NoiseWrapper.prototype.process = function(threshold,frequency,gain) {

    switch (this.type) {

        case Roar:
            return this.noise.process(threshold/10,gain*0.9);
            break;

        case Static:
            return this.noise.process(threshold,gain);
            break;

        case Crackle:
            return this.noise.process(threshold,gain*2.5);
            break;

        case Rumble:
            return this.noise.process(frequency,gain);
            break;

        case White:
            return this.noise.process(gain);
            break;

        case Pink:
            return this.noise.process(gain*1.6);
            break;

        case Brown:
            return this.noise.process(gain*2.6);
            break;

        case BrownWhite:
            return this.noise.process(threshold-0.2,gain);
            break;
    }
};



module.exports = SnarePlayer;