
var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var Comb = require('./Comb');
var AllPass = require('./AllPass');

// Attempting to recreate the Freeverb, using this as a guide:
// http://wavepot.com/opendsp/freeverb

//-------------------------------------------------------------------------------------------
//  MONO INIT
//-------------------------------------------------------------------------------------------

function FreeVerb() {
    this.combTimesA = [1116,1188,1277,1356];
    this.combTimesB = [1422,1491,1557,1617];
    this.allPassTimes = [225,556,441,341];

    this.combsA = [];
    this.combsB = [];
    this.allPass = [];

    for (var i=0; i<4; i++) {
        this.combsA.push( new Comb.mono());
        this.combsB.push( new Comb.mono());
        this.allPass.push( new AllPass.mono());
    }
}


//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------


FreeVerb.prototype.process = function(signal,room,damp) {

    damp = utils.arg(damp,0.5);
    room = utils.arg(room,0.5);
    var i;
    var output = 0;

    // Process comb filters //

    damp *= 0.4;
    room = room * 0.28 + 0.7;
    for (i=0; i<4; i++) {
        output += this.combsA[i].process(signal,this.combTimesA[i],damp,room);
        output += this.combsB[i].process(signal,this.combTimesB[i],damp,room);
    }

    // Process all-pass filters //
    for (i=0; i<4; i++) {
        output = this.allPass[i].process(output,this.allPassTimes[i]);
    }

    return output;
};


//-------------------------------------------------------------------------------------------
//  STEREO INIT
//-------------------------------------------------------------------------------------------

function StereoFreeVerb() {
    this.r1 = new FreeVerb();
    this.r2 = new FreeVerb();
}

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

StereoFreeVerb.prototype.process = function(signal,room,damp,mix) {
    return [
        (signal[0] * (1-mix)) + (this.r1.process(signal[0],room,damp) * mix),
        (signal[1] * (1-mix)) + (this.r2.process(signal[1],room,damp) * mix)
    ];
};


module.exports = {
    mono: FreeVerb,
    stereo: StereoFreeVerb
};