
var utils = require('./lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// These are vanilla javascript components used for generating/filtering audio signals.
// Multiple techniques are used, subtractive & additive synthesis, wavetables, granular
// self-sampling, IIR & FIR filtering.
// Generally learning & refining stuff as I go, combining what I've picked up from standard
// signal processing techniques with generative/chance methods.
// I've started separating these out to individual files, (in the folder 'audioComponents').
// I'm no signal processing expert, so lots of trial & error and experimental noisiness here!


// INLINE FILTERS //
var clipping = require('./audioComponents/filters/Clipping');
var compressor = require('./audioComponents/filters/Compressor');
var erode = require('./audioComponents/filters/Erode');
var feedback = require('./audioComponents/filters/Feedback');
var foldBack = require('./audioComponents/filters/FoldBack');
var foldBackII = require('./audioComponents/filters/FoldBackII');
var invert = require('./audioComponents/filters/Invert');
var panner = require('./audioComponents/filters/Panner');
var reverb = require('./audioComponents/filters/Reverb');
var reverseDelay = require('./audioComponents/filters/ReverseDelay');
var saturation = require('./audioComponents/filters/Saturation');
var softClip = require('./audioComponents/filters/SoftClip');

// PERSISTENT FILTERS //
var AllPass = require('./audioComponents/filters/AllPass');
var Biquad = require('./audioComponents/filters/Biquad');
var Comb = require('./audioComponents/filters/Comb');
var CompressorII = require('./audioComponents/filters/CompressorII');
var EQ = require('./audioComponents/filters/EQ');
var FreeVerb = require('./audioComponents/filters/Freeverb');
var GrainHold = require('./audioComponents/filters/GrainHold');
var GrainHoldII = require('./audioComponents/filters/GrainHoldII');
var GranularChorus = require('./audioComponents/filters/GranularChorus');
var GranularChorusII = require('./audioComponents/filters/GranularChorusII');
var GranularChorusIII = require('./audioComponents/filters/GranularChorusIII');
var GranularDelay = require('./audioComponents/filters/GranularDelay');
var GranularDelayII = require('./audioComponents/filters/GranularDelayII');
var GranularDelayIII = require('./audioComponents/filters/GranularDelayIII');
var LowPass = require('./audioComponents/filters/LowPass');
var LowPassII = require('./audioComponents/filters/LowPassII');
var Noise = require('./audioComponents/filters/Noise');
var MultiPass = require('./audioComponents/filters/MultiPass');
var PhonoCrackle = require('./audioComponents/filters/PhonoCrackle');
var Q = require('./audioComponents/filters/Q');
var Repeater = require('./audioComponents/common/Repeater');
var Resonant = require('./audioComponents/filters/Resonant');
var RetroDelay = require('./audioComponents/filters/RetroDelay');
var ReverbII = require('./audioComponents/filters/ReverbII');
var StereoExpander = require('./audioComponents/filters/StereoExpander');
var Tremolo = require('./audioComponents/filters/Tremolo');
var Volumizer = require('./audioComponents/filters/Volumizer');

// CHANNEL FILTERS //
var CompressorIII = require('./audioComponents/filters/CompressorIII');
var ChannelEQ = require('./audioComponents/channelFilters/ChannelEQ');
var PeakCompressor = require('./audioComponents/channelFilters/PeakCompressor');
var RMSCompressor = require('./audioComponents/channelFilters/RMSCompressor');

// SIGNAL GENERATORS //
var Call = require('./audioComponents/generators/Call'); // wip
var Chime = require('./audioComponents/generators/Chime');
var ChimeCluster = require('./audioComponents/generators/ChimeCluster');
var Click = require('./audioComponents/generators/Click');
var Cluster = require('./audioComponents/generators/Cluster');
var Flocking = require('./audioComponents/generators/Flocking');
var FMSine = require('./audioComponents/generators/FMSine');
var FuzzBurst = require('./audioComponents/generators/FuzzBurst');
var Metallic = require('./audioComponents/generators/Metallic');
var Pattern = require('./audioComponents/generators/Pattern');
var PatternII = require('./audioComponents/generators/PatternII'); // wip
var Purr = require('./audioComponents/generators/Purr');
var Ramp = require('./audioComponents/generators/Ramp');
var Resampler = require('./audioComponents/generators/Resampler');
var Sample = require('./audioComponents/generators/Sample');
var Siren = require('./audioComponents/generators/Siren');
var StaticGen = require('./audioComponents/generators/Static');
var Sweep = require('./audioComponents/generators/Sweep');
var SweepII = require('./audioComponents/generators/SweepII');
var Testing = require('./audioComponents/generators/Testing');

// INSTRUMENTS //
var ClapPlayer = require('./audioComponents/instruments/Clap');
var KickPlayer = require('./audioComponents/instruments/Kick');

// VOICES //
var Brown = require('./audioComponents/voices/BrownNoise');
var Crackle = require('./audioComponents/voices/CrackleNoise');
var HarmonicSine = require('./audioComponents/voices/HarmonicSine');
var Pink = require('./audioComponents/voices/PinkNoise');
var Perlin = require('./audioComponents/voices/Perlin');
var Roar = require('./audioComponents/voices/RoarNoise');
var Rumble = require('./audioComponents/voices/RumbleNoise');
var SawTooth = require('./audioComponents/voices/SawTooth');
var Sine = require('./audioComponents/voices/Sine');
var Static = require('./audioComponents/voices/StaticNoise');
var Triangle = require('./audioComponents/voices/Triangle');
var table = require('./audioComponents/voices/Tables');
var WavePlayer = require('./audioComponents/voices/WavePlayer');
var White = require('./audioComponents/voices/WhiteNoise');

// MODS //
var FudgeChance = require('./audioComponents/mods/FudgeChance');
var Glide = require('./audioComponents/mods/Glide');
var LFO = require('./audioComponents/mods/LFO');
var MoveTo = require('./audioComponents/mods/MoveTo');
var PerlinMod = require('./audioComponents/mods/Perlin');
var WalkSmooth = require('./audioComponents/mods/WalkSmooth');

// COMMON //
var ArrayEnvelope = require('./audioComponents/common/ArrayEnvelope');
var controlRange = require('./audioComponents/common/ControlRange');
var Combine = require('./audioComponents/common/Combine');
var Clock = require('./audioComponents/core/Clock');


// !!!
// Everything below this point is currently in the process of being tidied into the
// 'audioComponents' folder (it's taking a while!)
// so this section is pretty messy for now

//-------------------------------------------------------------------------------------------
//  VOICE OBJECT
//-------------------------------------------------------------------------------------------


function Voice(frequency) {
    this.frequency = frequency || 440;
    this.detune = 0;
    this.gain = 0.5;
    this.panning = tombola.rangeFloat(-1,1);
    this.amplitude = 0;
    this.polarity = -1;
    this.type = 1;
}
Voice.prototype.process = function(signal,type) {

    type = utils.arg(type,'none');

    // UPDATE VOICE //
    if (tombola.chance(1,500)) {
        this.gain += tombola.fudgeFloat(1, 0.01); // this makes some artefacts, look at alts
    }
    this.panning += tombola.rangeFloat(-0.005,0.005);
    this.panning = utils.valueInRange(this.panning, -1, 1);

    this.frequency = utils.valueInRange(this.frequency, 10, 19000);
    this.gain = utils.valueInRange(this.gain, 0, 0.5);


    // UPDATE VOICE WAVE SHAPES //
    if (type==='none' && tombola.chance(1,5000)) {
        this.type = -this.type;
    }
    if (type==='sawtooth') this.type = -1;
    if (type==='triangle') this.type = 1;

    if (this.type===-1) {
        waveSawtooth(this, 1);
    } else {
        waveTriangle(this, 1);
    }

    return [
        signal[0] + ((this.amplitude * this.gain) * (1 + (-this.panning))),
        signal[1] + ((this.amplitude * this.gain) * (1 + this.panning))
    ];
};



// PHASE VOICE WRAPPER //
function PhaseWrapper() {
    this.phase = new PhaseSine();
    this.panning = tombola.rangeFloat(-1,1);
}
PhaseWrapper.prototype.process = function(signal, mix, frequency, f1, f2, amp) {

    f1 = f1 || 3;
    f2 = f2 || 95;
    amp = utils.arg(amp,1);

    var ps = this.phase.process(frequency, f1, f2)/2;
    this.panning += (tombola.fudge(1,1)*0.005);
    this.panning = utils.valueInRange(this.panning, -1, 1);

    return [
        (signal[0]*(1-(mix*amp))) + ((ps * (mix*amp)) * (1 + (-this.panning))),
        (signal[1]*(1-(mix*amp))) + ((ps * (mix*amp)) * (1 + this.panning))
    ];
};





//-------------------------------------------------------------------------------------------
//  WAVE SHAPE ALGORITHMS
//-------------------------------------------------------------------------------------------


function waveShape(shape, voice, amp) {
    switch (shape) {
        case 'triangle' :
            this.waveTriangle(voice, amp);
            break;
        case 'sawtooth' :
            this.waveSawtooth(voice, amp);
            break;
        default :
            break;
    }
}


// TRIANGLE //
function waveTriangle(voice, amp) {
    // update voice value //
    var step = ((voice.frequency + voice.detune) * (4/sampleRate));
    voice.amplitude += (step * voice.polarity);

    // stay within amplitude bounds //
    var spill = 0;
    if (voice.amplitude > amp) {
        spill = voice.amplitude - amp;
        voice.amplitude = amp - spill;
        voice.polarity = - voice.polarity;
    }
    if (voice.amplitude < -amp) {
        spill = (voice.amplitude - (-amp));
        voice.amplitude = (-amp) - spill;
        voice.polarity = - voice.polarity;
    }
}




// ARC //
function waveArc(voice, amp, i) {
    var x = (sampleRate/voice.frequency);
    var a = x * Math.floor((i/sampleRate)*voice.frequency);
    voice.amplitude = (1 - ( Math.sqrt(Math.pow(x,2) - Math.pow(i-a,2)) / (x/2) )) * amp;
}


// ARC 2 //
// has a frequency leak
function waveArc2(voice, amp, i) {
    var x = (sampleRate/(voice.frequency));
    var m = Math.floor(i/x+1);
    var a = ((x) * m);
    if (m%2==0) {
        voice.amplitude = (-1 + ( Math.sqrt(Math.pow(x,2) - Math.pow(i-a,2)) / Math.round(x/2) )) * amp;
    } else {
        voice.amplitude = (1 - ( Math.sqrt(Math.pow(x,2) - Math.pow(i-a,2)) / Math.round(x/2) )) * amp;
    }
}


// ARC 3 //
// has a frequency leak
function waveArc3(voice, amp, i) {
    var t = i;
    var d = Math.floor((sampleRate)/(voice.frequency));
    var m = Math.floor(i/(d));
    var b = -1; // start
    var c = 2; // change
    if (m%2==0) {
        b = 1;
        c = -2;
    }
    t -= ((m * (d)));
    t /= (d);
    voice.amplitude =  (c*t*t*t*t + b) * amp;
}



//-------------------------------------------------------------------------------------------
//  PERSISTENT FILTERS
//-------------------------------------------------------------------------------------------


// PHASE SINE //
function PhaseSine() {
    this.f = 200;
    this.v = 0;

    this.mf1 = 10;
    this.mv1 = 0;
    this.ma1 = 1;

    this.mf2 = 10;
    this.mv2 = 0;
    this.ma2 = 0.6;
}
PhaseSine.prototype.process = function(f,mf1,mf2) {

    if (f) this.f = f;
    if (mf1) this.mf1 = mf1;
    if (mf2) this.mf2 = mf2;

    // modulation waves //
    this.mv1 += this.mf1/(sampleRate/4);
    if(this.mv1 > 2) this.mv1 -= 4;

    this.mv2 += this.mf2/(sampleRate/4);
    if(this.mv2 > 2) this.mv2 -= 4;

    var m1 = this.mv1 * this.ma1;
    var m2 = this.mv2 * this.ma2;
    //m1 = 1;


    // affected wave //
    this.v += (((this.f)/(sampleRate/4)));
    if(this.v > 2) this.v -= 4;
    return ((this.v * m1) + m2) * (2-Math.abs((this.v * m1) + m2));
};







// WAIL //
function FilterWail() {
    this.voices = [];
    this.f = [];
    this.a = 0;
    this.i = -1;
    this.l = 0;
    this.d = 0;
    this.b = false;
}
FilterWail.prototype.process = function(input,ducking,chance,max,retrigger) {

    if (tombola.chance(1,chance) && (retrigger || this.a<0.05)) {
        max = max || 100;
        this.b = tombola.chance(1,6);
        this.i = 0;
        this.a = 0;
        var f;
        if (this.b) {
            f = tombola.rangeFloat(100,800);
            this.l = tombola.range(max * 300,max * 1000);
        } else {
            f = tombola.rangeFloat(60,800);
            this.l = tombola.range(max * 50,max * 1000);
        }

        var voiceType = tombola.item([table.Metallic,table.Voice2,table.Voice3]);
        this.voices = [];
        this.f = [];
        var voiceNo = tombola.range(7,10);
        this.d = tombola.rangeFloat(-(f/(max*4000)), (f/(max*4000)));
        var mf = 0;
        for (var i=0; i<voiceNo; i++) {
            mf = (f + tombola.fudgeFloat(14,(f/40)));
            this.f.push(mf);
            this.voices.push(new WavePlayer(new voiceType()));
        }
    }

    if (this.i>=0 && this.i<this.l) {

        this.i++;

        var attack = (this.l*0.0005);
        var decay = (this.l*0.05);
        var sustain = 0.4;
        var release = this.l - (attack + decay);
        if (!this.b) {
            if (this.i<(this.l*0.4)) {
                this.a += (1/(this.l*0.4));
            }
            if (this.i>(this.l/2)) {
                this.a -= (1/(this.l/2));
            }
        } else {
            if (this.i<attack) {
                this.a += (1/attack);
            }
            if (this.i>attack && this.i<(attack + decay)) {
                this.a -= ((1-sustain)/decay);
            }
            if (this.i>(attack + decay)) {
                this.a -= (sustain/release);
            }
        }


        // voices//
        var signal = [0,0];
        var vl = this.voices.length;
        for (i=0; i<vl; i++) {
            this.f[i] += this.d;
            this.f[i] = valueInRange(this.f[i],10,20000);
            var voice = this.voices[i];
            signal = voice.process(signal,this.f[i]);
        }
        signal[0] *= (1/vl);
        signal[1] *= (1/vl);

        input = [
            (input[0] * (1-(this.a * ducking))) + (signal[0] * this.a),
            (input[1] * (1-(this.a * ducking))) + (signal[1] * this.a)
        ];

        if (this.i>=this.l) {
            this.i = -1;
        }
    }
    return input;
};


// SUB HOWL //
function FilterSubHowl() {
    this.filter = new LowPass.mono();
    this.mod = new MoveTo();
    this.p = tombola.rangeFloat(-1,1);
}
FilterSubHowl.prototype.process = function(input,amp) {


    // pan //
    this.p += tombola.rangeFloat(-0.005,0.005);
    this.p = valueInRange(this.p, -1, 1);

    //voice //
    var t = this.filter.process(controlRange(150,700,this.mod.process(0.25,20000)),0.9,tombola.rangeFloat(-1,1));
    var signal = [
        t * (1 + -this.p),
        t * (1 + this.p)
    ];

    return [
        (input[0] * (1-(amp))) + (signal[0] * amp),
        (input[1] * (1-(amp))) + (signal[1] * amp)
    ];
};


// HOWL //
function FilterHowl() {
    this.voices = [];
    this.f = [];
    this.a = 1;
}
FilterHowl.prototype.process = function(input,frequency,amp) {

    if (this.voices.length === 0) {
        var voiceType = tombola.item([table.Metallic,table.Voice2,table.Voice3]);
        this.voices = [];
        this.f = [];
        var voiceNo = tombola.range(7,10);
        var mf = 0;
        for (var i=0; i<voiceNo; i++) {
            mf = (tombola.fudgeFloat(14,(frequency/40)));
            this.f.push(mf);
            this.voices.push(new WavePlayer(new voiceType()));
        }
    }

    // voices//
    var signal = [0,0];
    var vl = this.voices.length;
    for (i=0; i<vl; i++) {
        this.f[i] += tombola.fudgeFloat(2,this.f[i]*0.0005);
        var freq = frequency + this.f[i];
        freq = valueInRange(freq,10,20000);
        var voice = this.voices[i];
        signal = voice.process(signal,freq);
    }
    signal[0] *= (1/vl);
    signal[1] *= (1/vl);


    return [
        (input[0] * (1-(amp))) + (signal[0] * amp),
        (input[1] * (1-(amp))) + (signal[1] * amp)
    ];
};


// BURST //
function FilterBurst() {
    this.voices = [];
    this.f = [];
    this.a = 0;
    this.i = -1;
    this.l = 0;
    this.d = 0;
}
FilterBurst.prototype.process = function(input,ducking,chance,max,retrigger,maxf) {

    if (tombola.chance(1,chance) && (retrigger || this.a<0.06)) {
        max = max || 300;
        maxf = maxf || 200;
        this.i = 0;
        this.a = 0;
        var f = tombola.rangeFloat(maxf*0.35,maxf);
        this.l = tombola.range(max * 500,max * 1000);


        var voiceType = tombola.item([table.Metallic,table.Voice2,table.Voice3]);
        this.voices = [];
        this.f = [];
        var voiceNo = tombola.range(6,12);
        this.d = tombola.rangeFloat(-(f/400000), (f/400000));
        var mf = 0;
        for (var i=0; i<voiceNo; i++) {
            mf = (f + tombola.fudgeFloat(14,(f/40)));
            this.f.push(mf);
            this.voices.push(new WavePlayer(new voiceType()));
        }
    }

    if (this.i>=0 && this.i<this.l) {

        this.i++;

        var attack = (this.l*0.0005);
        var decay = (this.l*0.05);
        var sustain = 0.4;
        var release = this.l - (attack + decay);
        if (this.i<attack) {
            this.a += (1/attack);
        }
        if (this.i>attack && this.i<(attack + decay)) {
            this.a -= ((1-sustain)/decay);
        }
        if (this.i>(attack + decay)) {
            this.a -= (sustain/release);
        }

        // voices//
        var signal = [0,0];
        var vl = this.voices.length;
        for (i=0; i<vl; i++) {
            this.f[i] += ((tombola.fudgeFloat(6,6)*this.f[i])/sampleRate);
            this.f[i] = valueInRange(this.f[i],10,20000);
            var voice = this.voices[i];
            signal = voice.process(signal,this.f[i]);
        }
        signal[0] *= (1/vl);
        signal[1] *= (1/vl);

        input = [
            (input[0] * (1-(this.a * ducking))) + (signal[0] * this.a),
            (input[1] * (1-(this.a * ducking))) + (signal[1] * this.a)
        ];

        if (this.i>=this.l) {
            this.i = -1;
        }
    }
    return input;
};



// PULSE //
function FilterPulse() {
    this.t = 0;
    this.f = 50;
    this.a = 1;
    this.p = 0;
    this.i = -1;
    this.l = tombola.range(2000,10000);
}
FilterPulse.prototype.process = function(input,ducking,reverse,mix) {
    ducking = ducking || 0;
    reverse = reverse || false;
    mix = utils.arg(mix,1);

    if (this.i<=0) {
        this.i = 0;
        this.f = tombola.range(20,40);
        this.a = 1;
        if (reverse) {
            this.f = tombola.range(2,22);
            this.a = 0;
        }
        this.t = 0;
        this.l += 1000;
        if (tombola.chance(1,5)) {
            this.l = tombola.range(500,20000);
        }
    }

    if (this.i>=0 && this.i<this.l) {

        this.i++;

        if (reverse) {
            this.f += (18/this.l);
            this.a += (1/this.l);
        } else {
            this.f -= (18/this.l);
            this.a -= (1/this.l);
        }

        // pan //
        this.p += tombola.rangeFloat(-0.008,0.008);
        this.p = valueInRange(this.p, -1, 1);

        this.t += (this.f * (4/sampleRate));
        if (this.t>3) this.t = (this.t - 4);
        var t = this.t;
        if (t>1) t = (1-this.t);

        var signal = [
            (t + tombola.fudgeFloat(2,0.1)) * (1 + -this.p),
            (t + tombola.fudgeFloat(2,0.1)) * (1 + this.p)
        ];

        input = [
            ((input[0]*0.95) * (1-((this.a * mix) * ducking))) + (signal[0] * (this.a * mix)),
            ((input[1]*0.95) * (1-((this.a * mix) * ducking))) + (signal[1] * (this.a * mix))
        ];

        if (this.i>=this.l) {
            this.i = -1;
        }
    }
    return input;
};


// GROWL //
function FilterGrowl() {
    this.a = 0;
    this.ma = 0;
    this.i = -1;
    this.mi = 0;
    this.c = 0;
    this.f = 0;
    this.mf = 0;
    this.l = [];
    this.tl = 0;
    this.p = 0;
    this.v = 0;
    this.n = 0;
}
FilterGrowl.prototype.process = function(input,ducking,chance) {

    if (this.i<=0 && tombola.chance(1,chance)) {
        this.l = [];
        this.tl = 0;
        var pulses = tombola.range(10,30);
        var l = tombola.range(800,5000);
        var d = tombola.range(-400,400);
        for (var i=0; i<pulses; i++) {
            this.l.push(l);
            this.tl += l;
            if (tombola.chance(1,3)) {
                d = tombola.range(-400,400);
            }
            if ((l+d)<800) d = tombola.range(0,400);
            if ((l+d)>5000) d = tombola.range(-400,0);
            l += d;
        }

        this.mf = this.f = (6300 - this.l[0])/30;
        this.i = 0;
        this.a = 0;
        this.ma = 0;
        this.c = 0;
        this.v = 0;
        this.mi = 0;
        this.n = tombola.range(3,8);
    }

    if (this.c<(this.l.length-1) && this.i>=0) {

        if (this.i<this.l[this.c]) {
            this.i ++;
        } else {
            this.i = 0;
            this.c += 1;
            this.a = 0;
            this.mf = (6300 - this.l[this.c])/30;
            this.f = this.mf;
        }
        this.mi ++;

        // amp //
        var attack = this.l[this.c]*0.1;
        var release = this.l[this.c] - attack;
        if (this.i<attack) {
            this.a += (1/attack);
        }
        if (this.i>attack) {
            this.a -= (1/release);
        }

        // master amp //
        attack = this.tl*0.3;
        release = this.tl*0.4;
        if ((this.mi)<attack) {
            this.ma += (1/attack);
        }
        if ((this.mi)>(this.tl-release)) {
            this.ma -= (1/release);
        }

        // pitch //
        this.f -= ((this.mf*0.6)/this.l[this.c]);

        // pan //
        this.p += tombola.rangeFloat(-0.005,0.005);
        this.p = valueInRange(this.p, -1, 1);

        //voice //
        this.v += this.f/(sampleRate/4);
        if(this.v > 2) this.v -= 4;
        var t = this.v*(2-Math.abs(this.v));

        var signal = [
            (t + tombola.fudgeFloat(this.n,0.03)) * (1 + -this.p),
            (t + tombola.fudgeFloat(this.n,0.03)) * (1 + this.p)
        ];

        input = [
            (input[0] * (1-((this.a * this.ma) * ducking))) + (signal[0] * (this.a * this.ma)),
            (input[1] * (1-((this.a * this.ma) * ducking))) + (signal[1] * (this.a * this.ma))
        ];
    }
    return input;
};



// NOISE PULSE //
function FilterNoisePulse() {
    this.a = 0;
    this.ma = 0;
    this.i = -1;
    this.mi = 0;
    this.c = 0;
    this.l = [];
    this.tl = 0;
    this.p = 0;
    this.voice = null;
}
FilterNoisePulse.prototype.process = function(input,ducking,chance) {

    if (this.i<=0 && tombola.chance(1,chance)) {
        this.l = [];
        this.tl = 0;
        var pulses = tombola.range(10,30);
        var l = tombola.range(800,5000);
        var d = tombola.range(-400,400);
        for (var i=0; i<pulses; i++) {
            this.l.push(l);
            this.tl += l;
            if (tombola.chance(1,3)) {
                d = tombola.range(-400,400);
            }
            if ((l+d)<800) d = tombola.range(0,400);
            if ((l+d)>5000) d = tombola.range(-400,0);
            l += d;
        }
        this.i = 0;
        this.a = 0;
        this.ma = 0;
        this.c = 0;
        this.mi = 0;
        this.voice = tombola.item( [new Roar(tombola.rangeFloat(0.2,0.9)), new Brown(), new ePink(), new Static(tombola.rangeFloat(0.5,5)), new Crackle(tombola.rangeFloat(0.05,5))]);
    }

    if (this.c<(this.l.length-1) && this.i>=0) {

        if (this.i<this.l[this.c]) {
            this.i ++;
        } else {
            this.i = 0;
            this.c += 1;
            this.a = 0;
        }
        this.mi ++;

        // amp //
        var attack = this.l[this.c]*0.1;
        var release = this.l[this.c] - attack;
        if (this.i<attack) {
            this.a += (1/attack);
        }
        if (this.i>attack) {
            this.a -= (1/release);
        }

        // master amp //
        attack = this.tl*0.3;
        release = this.tl*0.4;
        if ((this.mi)<attack) {
            this.ma += (1/attack);
        }
        if ((this.mi)>(this.tl-release)) {
            this.ma -= (1/release);
        }

        // pan //
        this.p += tombola.rangeFloat(-0.005,0.005);
        this.p = valueInRange(this.p, -1, 1);

        //voice //
        var n = this.voice.process();
        var signal = [
            n * (1 + -this.p),
            n * (1 + this.p)
        ];

        input = [
            (input[0] * (1-((this.a * this.ma) * ducking))) + (signal[0] * (this.a * this.ma)),
            (input[1] * (1-((this.a * this.ma) * ducking))) + (signal[1] * (this.a * this.ma))
        ];
    }
    return input;
};




function SimpleTriangle(frequency) {
    this.f = frequency;
    this.v = 0;
}
SimpleTriangle.prototype.process = function() {
    this.v += (this.f * (2/sampleRate));
    if (this.v>4) this.v -= 4;
    var t = this.v-1;
    if (t>1) t = (2-t);
    return utils.valueInRange(t,-1,1);
};

function SimpleTriangle2(frequency) {
    this.f = frequency;
    this.v = 0;
}
SimpleTriangle2.prototype.process = function() {
    this.v += (this.f * (2/sampleRate));
    if (this.v>4) this.v -= 4;
    var t = this.v;
    if (t>2) t = (2-t);
    return utils.valueInRange(t-1,-1,1);
};


// BEEPS //
function FilterBeep() {
    this.a = 0;
    this.ma = 0;
    this.i = -1;
    this.mi = 0;
    this.c = 0;
    this.l = [];
    this.tl = 0;
    this.p = 0;
    this.voice = null;
    this.s = 0;
    this.f = 0;
    this.fd = 0;
}
FilterBeep.prototype.process = function(input,ducking,chance,mechanical) {

    if (this.i<=0 && tombola.chance(1,chance)) {
        mechanical = utils.arg(mechanical,tombola.percent(40));
        this.l = [];
        this.tl = 0;
        var min = 700;
        var max = 6500;
        var drift = tombola.range(600,1200);
        var pulses = tombola.range(4,10);
        var l = tombola.range(min,max);
        var d = tombola.range(-drift,drift);
        for (var i=0; i<pulses; i++) {
            this.l.push(l);
            this.tl += l;
            if (!mechanical) {
                if (tombola.chance(1,3)) {
                    d = tombola.range(-drift,drift);
                }
                if ((l+d)<min) d = tombola.range(0,drift);
                if ((l+d)>max) d = tombola.range(-drift,0);
                l += d;
            }
        }
        this.i = 0;
        this.a = 0;
        this.ma = 0;
        this.c = 0;
        this.mi = 0;
        this.s = tombola.rangeFloat(0.05,0.15);
        this.f = tombola.rangeFloat(200,2000);
        this.fd = 0;
        if (tombola.percent(20)) {
            this.fd = tombola.rangeFloat(0,this.f/1500);
        }
        this.voice = tombola.item([new SimpleTriangle(this.f), new SimpleTriangle2(this.f)]);
    }

    if (this.c<(this.l.length-1) && this.i>=0) {

        if (this.i<this.l[this.c]) {
            this.i ++;
        } else {
            this.i = 0;
            this.c += 1;
            this.a = 0;
        }
        this.mi ++;

        // amp //
        var attack = this.l[this.c]*0.001;
        var hold = this.l[this.c]*this.s;
        var release = this.l[this.c]*0.005;
        if (this.i<attack) {
            this.a += (1/attack);
        }
        if (this.i>=attack && this.i<(attack+hold)) {
            this.a = 1;
        }
        if (this.i>(attack+hold) && this.i<(attack+hold+release)) {
            this.a -= (1/release);
        }
        if (this.i>=(attack+hold+release)) {
            this.a = 0;
        }

        // master amp //
        attack = this.tl*0.3;
        release = this.tl*0.4;
        if ((this.mi)<attack) {
            this.ma += (1/attack);
        }
        if ((this.mi)>(this.tl-release)) {
            this.ma -= (1/release);
        }

        // pan //
        this.p += tombola.rangeFloat(-0.005,0.005);
        this.p = valueInRange(this.p, -1, 1);

        //voice //
        if (this.i===0) {
            this.voice.f = this.f;
        }
        if (this.a>0) {
            this.voice.f += this.fd;
        }
        var n = this.voice.process();
        var signal = [
            n * (1 + -this.p),
            n * (1 + this.p)
        ];

        input = [
            (input[0] * (1-((this.a * this.ma) * ducking))) + (signal[0] * ((this.a*0.8) * this.ma)),
            (input[1] * (1-((this.a * this.ma) * ducking))) + (signal[1] * ((this.a*0.8) * this.ma))
        ];
    }
    return input;
};


// SUB SWELL //
function FilterSubSwell() {
    this.a = 0;
    this.v = 0;
    this.f = 0;
    this.i = -1;
    this.l = 0;
    this.p = 0;
    this.d = 0;
    this.m = [0];
}
FilterSubSwell.prototype.process = function(input,ducking,chance,triangle) {

    if (tombola.chance(1,chance)) {
        this.i = 0;
        this.a = 0;
        this.v = 15;
        this.f = 0;
        this.l = tombola.range(30000,300000);
        this.m = [0];
        this.d = tombola.rangeFloat(7,40);
    }

    if (this.i>=0 && this.i<this.l) {

        this.i++;

        var h = this.l/2;
        if (this.i<(this.l*0.4)) {
            this.a += (1/(this.l*0.4));
        }
        if (this.i>(this.l*0.6)) {
            this.a -= (1/(this.l*0.4));
        }
        this.f = 15 + (this.a * (this.d)) + tombola.rangeFloat(-0.0005,0.0005);

        // pan //
        this.p += tombola.rangeFloat(-0.005,0.005);
        this.p = valueInRange(this.p, -1, 1);

        // voice //
        var t;
        if (triangle) {
            this.v += (this.f * (4/sampleRate));
             if (this.v>3) this.v = (this.v - 4);
             t = this.v;
             if (t>1) t = (1-this.v);
        } else {
            this.v += this.f/(sampleRate/4);
            if(this.v > 2) this.v -= 4;
            t = this.v*(2-Math.abs(this.v));
        }

        var m = 0;
        if (this.m.length>=200) {
            m = this.m[this.m.length-1];
            this.m = this.m.slice(0,200);
        }
        this.m.push((t + tombola.fudgeFloat(2,0.002)) * (1 + this.p));

        var signal = [
            (t + tombola.fudgeFloat(2,0.002)) * (1 + -this.p),
            m
        ];

        var threshold = this.a*1.5;
        if (threshold>1) threshold = 1;

        input = [
            (input[0] * (1-(threshold * ducking))) + (signal[0] * this.a),
            (input[1] * (1-(threshold * ducking))) + (signal[1] * this.a)
        ];

        if (this.i>=this.l) {
            this.i = -1;
        }
    }
    return input;
};




// FLIPPER //
function FilterFlipper() {
    this.c = 0;
    this.p = 1;
}
FilterFlipper.prototype.process = function(input,rate) {
    this.c += tombola.range(1,20);
    if (this.c>=(sampleRate/rate)) {
        this.c = 0;
        this.p = -this.p;
    }
    return input * this.p;
};

function FilterUnbalance() {
}
FilterUnbalance.prototype.process = function(signal,balance) {
    signal[0] += balance;
    signal[1] += balance;

    return [
        signal[0] *= (1-balance),
        signal[1] *= (1+balance)
    ];
};

function FilterShear() {
}
FilterShear.prototype.process = function(signal,channel,index,delay) {

    var i = Math.round(index - delay);
    if (i>0) {
        if (signal[0] > 0) {
            channel[0][i] = signal[0];
        }
        if (signal[1] > 0) {
            channel[1][i] = signal[1];
        }
    }
    return signal;
};



// CHOPPER //
function FilterChopper() {
    this.c = 0;
    this.p = 1;
    this.test = false;
}
FilterChopper.prototype.process = function(rate,depth) {
    this.c++;
    if (this.c>=rate) {
        this.c = 0;
        if (this.p===1) {
            this.p = depth;
        } else {
            this.p = 1;
        }
        this.test = true;
    }
    return this.p;
};

function FilterStereoChopper() {
    this.c = 0;
    this.p = 1;
}
FilterStereoChopper.prototype.process = function(signal,rate,depth) {
    this.c++;
    if (this.c>=rate) {
        this.c = 0;
        if (this.p===1) {
            this.p = depth;
        } else {
            this.p = 1;
        }
        this.test = true;
    }
    return [
        signal[0] * this.p,
        signal[1] * this.p
    ];
};

// DOWN SAMPLE //
function FilterDownSample() {
    this.memory = 0;
    this.c = -2;
}
FilterDownSample.prototype.process = function(size,input) {
    this.c ++;
    if (this.c>=size || this.c<0) {
        this.memory = input;
        this.c = 0;
    }
    return this.memory;
};

function FilterStereoDownSample() {
    this.ds1 = new FilterDownSample();
    this.ds2 = new FilterDownSample();
}
FilterStereoDownSample.prototype.process = function(signal,size,mix) {
    return [
        (signal[0] * (1-mix)) + (this.ds1.process(size,signal[0]) * mix),
        (signal[1] * (1-mix)) + (this.ds2.process(size,signal[1]) * mix)
    ];
};



//-------------------------------------------------------------------------------------------
//  CONTROLLERS
//-------------------------------------------------------------------------------------------



// SQUARE //
function Square() {
    this.p = -1;
    this.c = 0;
}
Square.prototype.process = function(r) {
    r = sampleRate/r;
    this.c ++;
    if(this.c > r) {
        this.p = -this.p;
        this.c = 0;
    }
    return  this.p;
};


// WALK //
function Walk() {
    this.p = tombola.rangeFloat(0,2);
    this.v = 0;
}
Walk.prototype.process = function(r,c) {
    this.p += this.v;
    if (this.p<0 || this.p>2) this.v = -this.v;
    this.p = utils.valueInRange(this.p,0,2);
    if (tombola.chance(1,c) || this.v===0) this.v += (tombola.rangeFloat(-r,r)/sampleRate);
    return this.p-1;
};

// WEAVE //
function Weave() {
    this.p = tombola.rangeFloat(0,2);
    this.v = 0;
}
Weave.prototype.process = function(r,c) {
    this.p += this.v;
    if (this.p<0) this.v = (tombola.rangeFloat(0,r)/sampleRate);
    if (this.p>2) this.v = (tombola.rangeFloat(-r,0)/sampleRate);
    this.p = utils.valueInRange(this.p,0,2);
    if (tombola.chance(1,c) || this.v===0) this.v = (tombola.rangeFloat(-r,r)/sampleRate);
    return this.p-1;
};

// WEAVE JUMP //
function WeaveJump() {
    this.p = tombola.rangeFloat(0,2);
    this.v = 0;
}
WeaveJump.prototype.process = function(r,c,c2) {
    this.p += this.v;
    if (this.p<0) this.v = (tombola.rangeFloat(0,r)/sampleRate);
    if (this.p>2) this.v = (tombola.rangeFloat(-r,0)/sampleRate);
    this.p = utils.valueInRange(this.p,0,2);
    if (tombola.chance(1,c) || this.v===0) this.v = (tombola.rangeFloat(-r,r)/sampleRate);
    if (tombola.chance(1,c2)) this.p = tombola.rangeFloat(0,2);
    return this.p-1;
};



// JUMP //
function Jump() {
    this.p = tombola.rangeFloat(-1,1);
}
Jump.prototype.process = function(c) {
    if (tombola.chance(1,c)) this.p = tombola.rangeFloat(-1,1);
    return this.p;
};

// LOOPER //
function Looper() {
    this.p = 0;
    this.v = tombola.rangeFloat(-1,1)/sampleRate;
    this.d = tombola.rangeFloat(0,1);
    this.v2 = tombola.rangeFloat(-0.1,0.1)/sampleRate;
}
Looper.prototype.process = function(r,g,c) {
    this.v += this.v2;
    this.v = valueInRange(this.v,-this.d/sampleRate,this.d/sampleRate);

    this.p += this.v;
    if (this.p<-1 || this.p>1) {
        this.p = 0;
    }

    if (tombola.chance(1,c)) {
        this.d = tombola.rangeFloat(0,r);
        this.v2 = tombola.rangeFloat(-g/sampleRate,g/sampleRate);
    }
    return valueInRange(this.p,-1,1);
};



// GLIDE2 //
function Glide2() {
    this.p = tombola.rangeFloat(-1,1);
    this.v = tombola.rangeFloat(-1,1)/sampleRate;
}
Glide2.prototype.process = function(r,c) {
    this.p += this.v;
    if (tombola.chance(1,c)) {
        this.v = tombola.rangeFloat(-r,r)/sampleRate;
    }
    if (this.p<-1 || this.p>1) {
        this.v = -this.v;
    }
    return valueInRange(this.p,-1,1);
};


// RANGE CHANCE //
function RangeChance() {
    this.p = tombola.rangeFloat(-1,1);
}
RangeChance.prototype.process = function(r,c) {
    if (tombola.chance(1,c)) {
        this.p += tombola.rangeFloat(-r,r);
    }
    this.p = valueInRange(this.p,-1,1);
    return this.p;
};


// TAKEOFF //
// needs work
function Takeoff() {
    this.p = tombola.rangeFloat(-1,1);
    this.v = tombola.rangeFloat(-1,1)/sampleRate;
}
Takeoff.prototype.process = function(r,c,d) {
    this.v += (this.v*(0.0005*r));
    this.p += this.v;
    if (this.p<-1 || this.p>1 || tombola.chance(1,c) || (d && d>0 && this.v<0) || (d && d<0 && this.v>0)) {
        var mn = -r;
        var mx = r;
        if (d && d>0) mn = 0;
        if (d && d<0) mx = 0;
        this.p = tombola.rangeFloat(-1,1);
        this.v = (tombola.rangeFloat(mn,mx)/sampleRate)/1000;
    }
    return valueInRange(this.p,-1,1);
};




function valueInRange(value,floor,ceiling) {
    if (value < floor) {
        value = floor;
    }
    if (value> ceiling) {
        value = ceiling;
    }
    return value;
}


module.exports = {
    Voice: Voice,
    VoicePink: Pink,
    VoiceBrown: Brown,
    White: White,
    Crackle: Crackle,
    Perlin: Perlin,
    Roar: Roar,
    Rumble: Rumble,
    SawTooth: SawTooth,
    Static: Static,
    Sine: Sine,
    Triangle: Triangle,
    HarmonicSine: HarmonicSine,

    waveTriangle: waveTriangle,
    WavePlayer: WavePlayer,


    clipping: clipping,
    compressor: compressor,
    erode: erode,
    feedback: feedback.stereo,
    foldBack: foldBack,
    foldBackII: foldBackII,
    invert: invert,
    panner: panner,
    reverb: reverb,
    reverseDelay: reverseDelay,
    saturation: saturation,
    softClip: softClip.stereo,



    Testing: Testing,
    Call: Call,
    Chime: Chime,
    ChimeCluster: ChimeCluster,
    Click: Click,
    Cluster: Cluster,
    Flocking: Flocking,
    FuzzBurst: FuzzBurst,
    FM: FMSine.wrapper,
    Metallic: Metallic,
    Pattern: Pattern,
    PatternII: PatternII,
    Purr: Purr,
    Ramp: Ramp,
    Resampler: Resampler,
    Sample: Sample,
    Siren: Siren,
    StaticGen: StaticGen,
    Sweep: Sweep,
    SweepII: SweepII,


    ClapPlayer: ClapPlayer,
    KickPlayer: KickPlayer,


    PhaseSine: PhaseSine,
    PhaseWrapper: PhaseWrapper,
    FilterWail: FilterWail,
    FilterPulse: FilterPulse,
    FilterGrowl: FilterGrowl,
    FilterSubSwell: FilterSubSwell,
    FilterBurst: FilterBurst,
    FilterHowl: FilterHowl,
    FilterNoisePulse: FilterNoisePulse,
    FilterBeep: FilterBeep,
    FilterSubHowl: FilterSubHowl,

    FilterFlipper: FilterFlipper,
    FilterChopper: FilterChopper,
    FilterStereoChopper: FilterStereoChopper,
    FilterDownSample: FilterDownSample,
    FilterStereoDownSample: FilterStereoDownSample,
    Repeater: Repeater,
    AllPass: AllPass.mono,
    StereoAllPass: AllPass.stereo,
    Biquad: Biquad.mono,
    StereoBiquad: Biquad.stereo,
    Comb: Comb.mono,
    StereoComb: Comb.stereo,
    CompressorII: CompressorII,
    EQ: EQ.mono,
    StereoEQ: EQ.stereo,
    FreeVerb: FreeVerb.mono,
    StereoFreeVerb: FreeVerb.stereo,
    GrainHold: GrainHold,
    GrainHoldII: GrainHoldII,
    GranularChorus: GranularChorus,
    GranularChorusII: GranularChorusII,
    GranularChorusIII: GranularChorusIII,
    GranularDelay: GranularDelay,
    GranularDelayII: GranularDelayII,
    GranularDelayIII: GranularDelayIII,
    LowPass: LowPass.mono,
    StereoLowPass: LowPass.stereo,
    LowPassII: LowPassII.mono,
    StereoLowPassII: LowPassII.stereo,
    MultiPass: MultiPass.mono,
    StereoMultiPass: MultiPass.stereo,
    PhonoCrackle: PhonoCrackle,
    Resonant: Resonant.mono,
    StereoResonant: Resonant.stereo,
    RetroDelay: RetroDelay.mono,
    StereoRetroDelay: RetroDelay.stereo,
    ReverbII: ReverbII.mono,
    StereoReverbII: ReverbII.stereo,
    StereoExpander: StereoExpander,
    Tremolo: Tremolo.mono,
    StereoTremolo: Tremolo.stereo,
    Noise: Noise.mono,
    StereoNoise: Noise.stereo,
    Q: Q.mono,
    StereoQ: Q.stereo,
    Volumizer: Volumizer,
    FilterShear: FilterShear,

    channelEQ: ChannelEQ,
    CompressorIII: CompressorIII,
    RMSCompressor: RMSCompressor,
    PeakCompressor: PeakCompressor,

    controlRange: controlRange,
    ArrayEnvelope: ArrayEnvelope,
    Combine: Combine,
    LFO: LFO,
    PerlinMod: PerlinMod,
    Square: Square,
    Walk: Walk,
    Weave: Weave,
    WeaveJump: WeaveJump,
    WalkSmooth: WalkSmooth,
    Jump: Jump,
    Looper: Looper,
    Glide: Glide,
    Glide2: Glide2,
    MoveTo: MoveTo,
    FudgeChance: FudgeChance,
    RangeChance: RangeChance,
    Takeoff: Takeoff,

    Clock: Clock
};