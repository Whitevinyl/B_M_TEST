var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var common = require('../common/Common');
var timeSignature = require('../TimeSignature');
var marker = require('../Marker');

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Clock() {
    this.bpm = tombola.range(40,120);
    this.signature = new timeSignature(4,4);
    this.measureIndex = 0;
    this.measureDuration = Math.floor((sampleRate * 60) / this.bpm) * this.signature.beats;

    this.markers = [];
    this.a = 0;
    this.adsr = [0,10,1,90];
    this.clicks = [];

}
var proto = Clock.prototype;


//-------------------------------------------------------------------------------------------
//  SETUP
//-------------------------------------------------------------------------------------------

proto.setup = function(bpm,beats,division) {

    // main time settings //
    this.bpm = bpm || this.bpm;
    this.signature.beats = beats || this.signature.beats;
    this.signature.division = division || this.signature.division;

    var beatLength = Math.floor((sampleRate * 60) / this.bpm);
    this.measureIndex = 0;
    this.measureDuration = beatLength * this.signature.beats;


    // metronome clicks //
    this.markers = [];
    this.markers.push(new marker(0,1,440));

    for (var i=1; i<this.signature.beats; i++) {
        this.markers.push(new marker(beatLength*i));
    }

};

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(signal,index) {

    // update the origin of each measure //
    if (index >= this.measureIndex + this.measureDuration) {
        this.measureIndex = index;
    }


    // create clicks //
    


    // process any active clicks //
    var l = this.clicks.length;
    for (var i=0; i<l; i++) {
        signal = this.clicks.process(signal,index);
    }

    return signal;
};





module.exports = Clock;