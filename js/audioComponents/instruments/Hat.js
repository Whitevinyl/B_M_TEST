var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var FMNoise = require('../voices/FMNoise');
var Expander = require('../filters/StereoExpander');
var Saturation = require('../filters/Saturation');
var MultiPass = require('../filters/MultiPass');

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
    this.markers.push(new marker(audioClock.getBeatLength('32')    ,1,440,this.adsr,this.envelope.duration));
    this.markers.push(new marker(audioClock.getBeatLength('32') * 2,1,440,this.adsr,this.envelope.duration));
    this.markers.push(new marker(audioClock.getBeatLength('32') * 3,1,440,this.adsr,this.envelope.duration));
    this.markers.push(new marker(audioClock.getBeatLength('32') * 4,1,440,this.adsr,this.envelope.duration));
    this.markers.push(new marker(audioClock.getBeatLength('32') * 5,1,440,this.adsr,this.envelope.duration));
    this.markers.push(new marker(audioClock.getBeatLength('32') * 6,1,440,this.adsr,this.envelope.duration));
    this.markers.push(new marker(audioClock.getBeatLength('32') * 7,1,440,this.adsr,this.envelope.duration));

}
var proto = HatPlayer.prototype;


//-------------------------------------------------------------------------------------------
//  RANDOMISE SETTINGS
//-------------------------------------------------------------------------------------------

proto.chooseVoice = function() {

    var detune = [tombola.rangeFloat(0.1,12),tombola.rangeFloat(0.1,12),tombola.rangeFloat(0.1,12)];
    var volume = [tombola.rangeFloat(0.12,1),tombola.rangeFloat(0.12,1),tombola.rangeFloat(0.12,1)];
    var pitch = tombola.rangeFloat(200,800);

    /*detune = [ 8.346484602450051, 6.00391539312223, 0.9435630777951444 ];
    volume = [ 0.8242089637374599, 0.5762752853121658, 0.8012876711600392 ];
    pitch = 546.0663282399037;*/

    // make hp relative of pitch //
    var ceil = Math.min(7000, (pitch * 10));
    ceil = Math.max(4000,ceil);
    var hp = tombola.rangeFloat(2100,ceil);
    hp =4895.935165704874;

    return {
        voice: FMNoise,
        pitch: pitch,
        detune: detune,
        volume: volume,
        hp: hp,
        expand: tombola.weightedItem([0,tombola.range(1,20)], [3,1])
    };
};



proto.chooseEnvelope = function() {

    // MAIN ENVELOPE //
    var oscEnv = [];
    var envStyle = tombola.weightedItem(['decay','shaker','double','triple','hold','zip'],[1,0.35,1,0.8,0.9,1]);
    switch (envStyle) {

        case 'decay':
            // straight decay //
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(25,50), 0, 'Out'));
            break;

        case 'shaker':
            // shaker //
            oscEnv.push(new common.EnvelopePoint(tombola.range(18,30), 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(5,10), 0, 'Out'));
            break;

        case 'double':
            // double Attack //
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(5,15), 0, 'Out'));
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(25,50), 0, 'Out'));
            break;

        case 'triple':
            // triple Attack //
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(5,15), 0, 'Out'));
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(5,15), 0, 'Out'));
            oscEnv.push(new common.EnvelopePoint(0, 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(25,45), 0, 'Out'));
            break;

        case 'hold':
            // square hold //
            var hold = tombola.range(5,20);
            var vol = 1 - (hold * 0.02);
            oscEnv.push(new common.EnvelopePoint(0, vol, 'In'));
            oscEnv.push(new common.EnvelopePoint(hold, vol, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(1,3), 0, 'Out'));
            break;

        case 'zip':
            // double ramp //
            oscEnv.push(new common.EnvelopePoint(tombola.range(5,20), 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(1,3), 0, 'Out'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(5,20), 1, 'In'));
            oscEnv.push(new common.EnvelopePoint(tombola.range(1,3), 0, 'Out'));
            break;
    }

    var duration = 0;
    for (var i=0; i<oscEnv.length; i++) {
        duration += oscEnv[i].time;
    }



    // FM ENVELOPE //
    var fmEnv = [];
    fmEnv.push(new common.EnvelopePoint(0, 1, 'In'));
    if (tombola.percent(25)) {
        var d = audioClock.samplesToMilliseconds(duration);
        var t = tombola.rangeFloat(0.4, 1.2) * d;
        var g = 0;
        if (envStyle === 'shaker' || envStyle === 'zip') {
            g = tombola.rangeFloat(0.1,0.5);
        }
        fmEnv.push(new common.EnvelopePoint(t, g, 'Out'));
    }




    return {
        duration: duration * 1.6,
        oscEnvelope: oscEnv,
        fmEnvelope: fmEnv,
        curves: tombola.item(['quadratic','cubic','quartic','quintic'])
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
    this.filter = new MultiPass.stereo();
    this.hp = voice.hp;

    // expander //
    this.width = voice.expand;
    if (this.width > 0) {
        this.expander = new Expander();
    }

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
    var noise = this.voice.process(this.pitch,this.detune[0],this.detune[1],this.detune[2],this.volume[0] * fmEnv,this.volume[1] * fmEnv,this.volume[2] * fmEnv) * a;

    // assemble //
    var signal = [
        noise * (1 + -this.p),
        noise * (1 +  this.p)
    ];


    // high pass //
    signal = this.filter.process(signal,'HP',this.hp, 1.49);

    // expander //
    if (this.expander) {
        signal = this.expander.process(signal,this.width);
    }


    // drive //
    signal = Saturation(signal,0.6,1);

    // clip any noise spikes //
    signal = common.clipStereo(signal,1);

    var ducking = 0.8;
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