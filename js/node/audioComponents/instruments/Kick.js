var utils = require('../../lib/utils');
var easing = require('../../lib/easing');
var Tombola = require('tombola');
var tombola = new Tombola();

var marker = require('../core/Marker');
var common = require('../common/Common');
var SineSquare = require('../voices/SineSquare');
var SineTriangle = require('../voices/SineTriangle');
var Expander = require('../filters/StereoExpander');
var drive = require('../filters/FoldBackII');
var Q = require('../filters/Q');

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function KickPlayer() {
    this.instances = [];
    this.markers = [];

    // voice //
    this.voice = this.chooseVoice();

    // envelope & duration //
    this.curves = tombola.item(['linear','quadratic','cubic','quartic','quintic']);
    this.adsr = [0,tombola.range(70,400),tombola.rangeFloat(0.4,1),tombola.range(100,420)];
    var d = this.adsr[0] + this.adsr[1] + this.adsr[3] + 10;
    d = audioClock.millisecondsToSamples(d);


    // drive //
    this.drive = this.chooseDrive();


    console.log(this.adsr);
    console.log(this.curves);
    console.log(this.voice);
    console.log(this.drive);

    this.markers.push(new marker(0,1,440,this.adsr,d));
    //this.markers.push(new marker(audioClock.getBeatLength('4'),1,440,this.adsr,d));
    //this.markers.push(new marker(audioClock.getBeatLength('4')*2,1,440,this.adsr,d));
    //this.markers.push(new marker(audioClock.getBeatLength('4')*3,1,440,this.adsr,d));
    this.markers.push(new marker(audioClock.getBeatLength('16') + (audioClock.getBeatLength('16')*(tombola.range(0,14))),1,440,this.adsr,d));

}
var proto = KickPlayer.prototype;


//-------------------------------------------------------------------------------------------
//  RANDOMISE SETTINGS
//-------------------------------------------------------------------------------------------

// VOICE //
proto.chooseVoice = function() {

    var type = tombola.weightedItem([SineSquare, SineTriangle], [3, 3]);
    var pitch = tombola.rangeFloat(32, 49);


    // mix between oscillators //
    var blend1 = 0;
    if (type === SineTriangle) {
        if (tombola.percent(40)) {
            blend1 = tombola.weightedItem([ tombola.rangeFloat(0,1), 1 ],[2,1]);
        }
    }
    else {
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


    // generate object //
    return {
        type: type,
        pitch: pitch,
        blend1: blend1,
        blend2: blend2,
        ratio: tombola.rangeFloat(4, 24),
        decay: tombola.range(5, 28),
        drift: tombola.rangeFloat(0.75,1.3)
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
            this.instances.push( new Kick(this.instances,marker.adsr,marker.duration,this.curves,this.voice,this.drive));
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

function Kick(parentArray,adsr,duration,curves,voice,drive) {

    // where we're stored //
    this.parentArray = parentArray;

    // envelope / duration //
    this.i = 0;
    this.a = 0;
    this.duration = duration || sampleRate;
    this.adsr = adsr || [3,10,0.3,89];
    this.curves = curves;


    // voice //
    this.voice = new voice.type();
    this.pitch = voice.pitch;
    this.blend1 = voice.blend1;
    this.blend2 = voice.blend2;
    this.pitchRatio = voice.ratio;
    this.decay = voice.decay;
    this.drift = voice.drift;
    this.p = 0; // panning;


    // filter //
    this.filter = new Q.stereo();

    // expander //
    this.expander = new Expander();

    // drive //
    this.driveAdsr = drive.envelope;
    this.threshold = drive.threshold;
    this.power = drive.power;
    this.driveMix = drive.mix;
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
    this.a = common.ADSREnvelopeII(this.i, this.duration, this.adsr, this.curves);


    // voice //
    var pb = common.rampEnvelope(this.i, this.duration, this.pitch*this.pitchRatio, this.pitch, 0, this.decay,'quinticOut');
    var pd = common.rampEnvelope(this.i, this.duration, 1, this.drift, 0, 100,'linearOut');
    var bl = common.rampEnvelope(this.i, this.duration, this.blend1, this.blend2, 0, 45,'linearOut');
    var n = this.voice.process(pb * pd, bl);



    var boost = 1;
    var signal = [
        n * ((1 + -this.p) * (this.a * boost)),
        n * ((1 +  this.p) * (this.a * boost))
    ];


    // drive //
    var da = common.ADSREnvelope(this.i, this.duration, this.driveAdsr, this.curves);
    signal = drive(signal,this.threshold,this.power,da * this.driveMix);


    // filter //
    signal = this.filter.process(signal,350,0.8,-0.4);

    // expander //
    //signal = this.expander.process(signal,20);


    // return with ducking //
    var ducking = 0.8;
    return [
        (input[0] * (1-(this.a * ducking))) + signal[0],
        (input[1] * (1-(this.a * ducking))) + signal[1]
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