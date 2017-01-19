var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var common = require('../common/Common');
var timeSignature = require('../TimeSignature');
var marker = require('../Marker');

var sine = require('../voices/Sine');

//-------------------------------------------------------------------------------------------
//  CLOCK
//-------------------------------------------------------------------------------------------
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

    var l,i;

    // update the origin of each measure //
    // place new metronome click markers //
    if (index >= this.measureIndex + this.measureDuration) {
        this.measureIndex = index;
        this.setup(this.bpm,this.signature.beats,this.signature.division);
    }


    // create clicks //
    l = this.markers.length;
    for (i=0; i<l; i++) {
        var marker = this.markers[i];
        if (index === (this.measureIndex + marker.time)) {
            this.clicks.push( new MetroClick(this.adsr,marker.pitch));
        }
    }


    // process any active clicks //
    l = this.clicks.length;
    for (i=0; i<l; i++) {
        signal = this.clicks.process(signal,index);
    }

    return signal;
};




//-------------------------------------------------------------------------------------------
//  METRONOME CLICK
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function MetroClick(adsr,pitch) {
    this.a = 0;
    this.adsr = adsr || [0,10,1,90];
    this.pitch = pitch || 220;
    this.voice = new sine();
    this.duration = 5000;
    this.i = 0;
}
proto = MetroClick.prototype;

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(input) {

    // count //
    this.i++;
    if (this.i>=this.duration) {
        this.kill();
    }

    // envelope //
    this.a = common.ADSREnvelope(this.i,this.duration,this.adsr);

    var signal = this.voice.process(this.pitch);

    return [
        input[0] + signal,
        input[1] + signal
    ];
};


//-------------------------------------------------------------------------------------------
//  KILL
//-------------------------------------------------------------------------------------------

proto.kill = function() {

};





module.exports = Clock;