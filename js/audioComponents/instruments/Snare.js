var utils = require('../../lib/utils');
var easing = require('../../lib/easing');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');

var SineSquare = require('../voices/SineSquare');
var SineTriangle = require('../voices/SineTriangle');
var Roar = require('../voices/RoarNoise');
var Brown = require('../voices/BrownNoise');
var Static = require('../voices/StaticNoise');
var Crackle = require('../voices/CrackleNoise');
var Pink = require('../voices/PinkNoise');
var Rumble = require('../voices/RumbleNoise');

var Expander = require('../filters/StereoExpander');
var drive = require('../filters/FoldBackII');
var Biquad = require('../filters/Biquad');

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

    // drive //
    this.drive = this.chooseDrive();

    // filter //
    this.filter = this.chooseFilter();

    console.log(this.filter);
    console.log(this.envelope);
    console.log(this.voice);
    console.log(this.drive);


    this.markers.push(new marker(audioClock.getBeatLength('4'),1,440,this.adsr,this.envelope.duration));
    this.markers.push(new marker(audioClock.getBeatLength('D2'),1,440,this.adsr,this.envelope.duration));
}
var proto = SnarePlayer.prototype;


//-------------------------------------------------------------------------------------------
//  RANDOMISE SETTINGS
//-------------------------------------------------------------------------------------------


// VOICE //
proto.chooseVoice = function() {

    var type = tombola.weightedItem([SineSquare, SineTriangle], [2, 3]);
    var pitch = tombola.rangeFloat(180, 400);

    // mix between oscillators //
    var blend1 = 0;
    if (type === SineTriangle) {
        // if we're a sineTriangle, there's a 1 in 3 chance of being full triangle
        if (tombola.percent(40)) {
            blend1 = tombola.weightedItem([ tombola.rangeFloat(0,1), 1 ],[2,1]);
        }
    }
    else {
        // otherwise we're a random blend between 1 - 0
        if (tombola.percent(30)) {
            blend1 = tombola.rangeFloat(0,1);
        }
    }
    var blend2 = blend1;

    // change mix over time //
    if (tombola.percent(50) || (type === SineSquare && blend1 > 0.35)) {
        if (blend1 > 0.6) {
            blend2 = tombola.rangeFloat(0,0.3); // down
        }
        else if (blend1 < 0.3) {
            blend2 = tombola.rangeFloat(0.6,1); // up
        }
        else {
            blend2 = tombola.item([tombola.rangeFloat(0,0.05),tombola.rangeFloat(0.95,1)]); // either extreme
        }
    }

    // agressive start more common than end //
    if (blend1<0.5 && blend2>0.5) {
        if (tombola.percent(20)) {
            var b1 = blend1;
            blend1 = blend2;
            blend2 = b1;
        }
    }


    var d = audioClock.samplesToMilliseconds(this.envelope.duration);
    var env = [];

    env.push( new common.EnvelopePoint(0,1,'In') );
    env.push( new common.EnvelopePoint(d*0.3,1,'In') );
    env.push( new common.EnvelopePoint(d*0.3,0,'InOut') );

    // generate object //
    return {
        type: type,
        pitch: pitch,
        blend1: blend1,
        blend2: blend2,
        ratio: tombola.rangeFloat(12, 30), // height of transient pitch
        thump: tombola.range(15, 30), // transient pitch decay milliseconds
        drift: tombola.rangeFloat(0.82,1.1), // body pitch drift
        envelope: env
    };
};



// ENVELOPE //
proto.chooseEnvelope = function() {

    var adsr = [0,tombola.range(30,100),tombola.rangeFloat(0.5,0.9),tombola.range(110,250)];
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

  return {
      highpass: tombola.rangeFloat(120,280) // relative of fundamental ?
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
            this.instances.push( new Snare(this.instances,this.envelope,this.voice,this.drive,this.filter));
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
//  SNARE INIT
//-------------------------------------------------------------------------------------------

function Snare(parentArray,envelope,voice,drive,filter) {

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
    this.blend1 = voice.blend1;
    this.blend2 = voice.blend2;
    this.pitchRatio = voice.ratio;
    this.thump = voice.thump;
    this.drift = voice.drift;
    this.oscEnvelope = voice.envelope;
    this.p = 0; // panning;

    // noise //
    this.noiseL = new Rumble();
    this.noiseR = new Rumble();
    this.noiseThresh1 = 9.5;
    this.noiseThresh2 = 7.5;



    // drive //
    this.driveAdsr = drive.envelope;
    this.threshold = drive.threshold;
    this.power = drive.power;
    this.driveMix = drive.mix;


    // filter //
    this.filter = new Biquad.stereo();
    this.hp = new Biquad.stereo();
    this.hpFreq = filter.highpass;

}
proto = Snare.prototype;


//-------------------------------------------------------------------------------------------
//  SNARE PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(input,level) {

    // count //
    this.i++;
    if (this.i >= this.duration) {
        this.kill();
    }


    // main envelope //
    this.a = common.ADSREnvelopeII(this.i, this.duration, this.adsr, this.curves);


    // voice //
    var pb = common.rampEnvelopeII(this.i, this.duration, this.pitch * this.pitchRatio, this.pitch, 0, this.thump, 'quinticOut');
    var pd = common.rampEnvelope(this.i, this.duration, 1, this.drift, 0, 100, 'linearOut');
    var bl = common.rampEnvelope(this.i, this.duration, this.blend1, this.blend2, 0, 45, 'linearOut');
    var oscEnv = common.multiEnvelope(this.i, this.duration, this.oscEnvelope, this.curves);
    var osc = this.voice.process(pb * pd, bl) * oscEnv;
    osc *= 0.33;

    //noise //
    var nt = common.rampEnvelope(this.i, this.duration, this.noiseThresh1, this.noiseThresh2, 0, 75, 'linearOut');
    var noiseL = this.noiseL.process(10000,1);
    var noiseR = this.noiseR.process(10000,1);
    noiseL /= 2;
    noiseR /= 2;
    noiseL = 0;
    noiseR = 0;

    var noise = [noiseL,noiseR];

    var signal = [
        (osc + noise[0]) * ((1 + -this.p) * this.a),
        (osc + noise[1]) * ((1 +  this.p) * this.a)
    ];


    // drive //
    /*var da = common.ADSREnvelope(this.i, this.duration, this.driveAdsr, this.curves);
    signal = drive(signal,this.threshold,this.power,da * this.driveMix);*/


    // filter //
    signal = this.hp.process(signal,'highpass',this.hpFreq,0,0);


    // return with ducking //
    var ducking = 0.8;
    return [
        (input[0] * (1-(this.a * ducking))) + signal[0],
        (input[1] * (1-(this.a * ducking))) + signal[1]
    ];
};



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



module.exports = SnarePlayer;