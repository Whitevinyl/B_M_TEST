var utils = require('../../lib/utils');
var easing = require('../../lib/easing');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var SineSquare = require('../voices/SineSquare');
var SineTriangle = require('../voices/SineTriangle');
var Expander = require('../filters/StereoExpander');

var FoldBackII = require('../filters/FoldBackII');
var FoldBack = require('../filters/FoldBack');
var Saturation = require('../filters/Saturation');
var WaveShaper = require('../filters/WaveDistortion');

var Q = require('../filters/Q');

// Procedurally generates synth kicks. Individual kick hits inherit their settings from
// the player, but can also adapt their settings & effects separate from all other hits.

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function KickPlayer() {
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
var proto = KickPlayer.prototype;


//-------------------------------------------------------------------------------------------
//  RANDOMISE SETTINGS
//-------------------------------------------------------------------------------------------

// VOICE //
proto.chooseVoice = function() {

    var type = tombola.weightedItem([SineSquare, SineTriangle], [1, 6]);
    var pitch = tombola.rangeFloat(32, 47);


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


    var click = 0;
    if (tombola.percent(65)) {
        click = tombola.rangeFloat(0,0.5);
        if (tombola.percent(28)) {
            click = tombola.rangeFloat(0.5,1);
        }
    }

    // testing //
    /*type = SineTriangle;
    blend1 = 1;
    blend2 = 0;
    click = 1;*/


    // pitch drift //
    var drift = 0;
    if (tombola.percent(5)) {
        drift = tombola.rangeFloat(0,1.1); // up
    }
    if (tombola.percent(50)) {
        drift = tombola.rangeFloat(0.7,0); // down
    }

    // generate object //
    return {
        type: type,
        pitch: pitch,
        blend1: blend1,
        blend2: blend2,
        ratio: tombola.rangeFloat(8, 30), // height of transient pitch
        thump: tombola.range(22, 39), // transient thump length in ms
        click: click, // transient click - phase offset on oscillator
        drift: drift // body pitch drift
    };
};


// ENVELOPE //
proto.chooseEnvelope = function() {

    var adsr = [0,tombola.range(80,170),tombola.rangeFloat(0.89,1),tombola.range(120,350)];
    var duration = adsr[0] + adsr[1] + adsr[3] + 10;

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
        type: tombola.item([FoldBack,FoldBackII,Saturation,WaveShaper]), //
        threshold: tombola.rangeFloat(0.1,0.6),
        power: tombola.range(0,8),
        envelope: [attack,0,1,tombola.range(0,100-attack)],
        mix: tombola.weightedItem([0,tombola.rangeFloat(0.1,0.5)],[1,0.8]),
        style: tombola.range(0,5)
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
            this.instances.push( new Kick(this.instances,this.envelope,this.voice,this.drive));
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

function Kick(parentArray,envelope,voice,drive) {

    // where we're stored //
    this.parentArray = parentArray;

    // envelope / duration //
    this.i = 0;
    this.duration = envelope.duration;
    this.adsr = envelope.adsr;
    this.curves = envelope.curves;


    // voice //
    this.voice = new voice.type(voice.click);
    this.pitch = voice.pitch;
    this.blend1 = voice.blend1;
    this.blend2 = voice.blend2;
    this.pitchRatio = voice.ratio;
    this.thump = voice.thump;
    this.drift = voice.drift;
    this.p = 0; // panning;


    // filter //
    this.filter = new Q.stereo();


    // drive //
    this.drive = drive.type;
    this.driveAdsr = drive.envelope;
    this.threshold = drive.threshold;
    this.power = drive.power;
    this.driveMix = drive.mix;
    this.driveStyle = drive.style;
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
    var a = common.ADSREnvelopeII(this.i, this.duration, this.adsr, this.curves);


    // voice //
    var pb = common.rampEnvelopeII(this.i, this.duration, this.pitch * this.pitchRatio, this.pitch, 0, this.thump, 'quinticOut');
    var pd = common.rampEnvelope(this.i, this.duration, 1, this.drift, 0, 100,'linearOut');
    var bl = common.rampEnvelope(this.i, this.duration, this.blend1, this.blend2, 0, 45,'linearOut');
    var n = this.voice.process(pb * pd, bl);



    var signal = [
        n * ((1 + -this.p) * a),
        n * ((1 +  this.p) * a)
    ];


    // drive //
    var da = common.ADSREnvelope(this.i, this.duration, this.driveAdsr, this.curves);

    if (this.drive === FoldBack) {
        signal = this.drive(signal,this.threshold,da * this.driveMix);
    }
    if (this.drive === FoldBackII) {
        signal = this.drive(signal,this.threshold,this.power,da * this.driveMix);
    }
    if (this.drive === Saturation) {
        signal = this.drive(signal,this.threshold,da * (this.driveMix*2));
    }
    if (this.drive === WaveShaper) {
        signal = this.drive(signal,this.threshold, this.driveStyle, da * (this.driveMix*2));
    }

    // filter //
    signal = this.filter.process(signal,290,0.8,-0.15);


    // return with ducking //
    var ducking = 0.8;
    return [
        (input[0] * (1-(a * ducking))) + signal[0],
        (input[1] * (1-(a * ducking))) + signal[1]
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