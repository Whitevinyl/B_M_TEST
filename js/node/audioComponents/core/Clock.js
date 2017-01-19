var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var common = require('../common/Common');
var timeSignature = require('./TimeSignature');
var marker = require('./Marker');

var sine = require('../voices/Sine');

//-------------------------------------------------------------------------------------------
//  CLOCK
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Clock() {
    this.bpm = 60;
    this.signature = new timeSignature(4,4);
    this.measureIndex = 0;
    this.measureDuration = Math.round((sampleRate * 60) / this.bpm) * this.signature.beats;

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

    var beatLength = Math.round((sampleRate * 60) / this.bpm);
    this.measureDuration = beatLength * this.signature.beats;


    // metronome clicks //
    var pitch = 1000;
    this.markers = [];
    this.markers.push(new marker(0,1,pitch*2,this.adsr,beatLength));

    for (var i=1; i<this.signature.beats; i++) {
        this.markers.push(new marker(beatLength*i,1,pitch,this.adsr,beatLength));
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
        this.bpm += 20;
        this.setup(this.bpm,this.signature.beats,this.signature.division);
    }


    // create clicks //
    l = this.markers.length;
    for (i=0; i<l; i++) {
        var marker = this.markers[i];
        if (index === (this.measureIndex + marker.time)) {
            this.clicks.push( new MetroClick(this.clicks,marker.adsr,marker.pitch,marker.duration));
        }
    }


    // process any active clicks //
    l = this.clicks.length-1;
    for (i=l; i>=0; i--) {
        signal = this.clicks[i].process(signal,index);
    }

    return signal;
};




//-------------------------------------------------------------------------------------------
//  METRONOME CLICK
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function MetroClick(parentArray,adsr,pitch,duration) {
    this.parentArray = parentArray;
    this.adsr = adsr || [0,10,1,90];
    this.pitch = pitch || 220;
    this.a = 0;
    this.voice = new sine();
    this.duration = duration || 5000;
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

    // voice //
    var signal = this.voice.process(this.pitch) * this.a;

    return [
        input[0] + signal,
        input[1] + signal
    ];
};


//-------------------------------------------------------------------------------------------
//  KILL
//-------------------------------------------------------------------------------------------

proto.kill = function() {
    var index = this.parentArray.indexOf(this);
    if (index > -1) {
        this.parentArray.splice(index, 1);
    }
};





module.exports = Clock;