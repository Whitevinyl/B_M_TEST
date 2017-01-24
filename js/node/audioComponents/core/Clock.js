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
    this.bpm = 70;
    this.signature = new timeSignature(4,4);
    this.measureIndex = 0;
    this.measureDuration = Math.round((sampleRate * 60) / this.bpm) * this.signature.beats;

    this.markers = [];
    this.a = 0;
    this.adsr = [0.5,10,1,89.5];
    this.clicks = [];
    this.duration = 6000;
    this.pitch = 1760;

    this.beats = [
         '64', '32', '16', '8', '4', '2', '1',
        'T64','T32','T16','T8','T4','T2','T1',
        'Q64','Q32','Q16','Q8','Q4','Q2','Q1',
        'D64','D32','D16','D8','D4','D2','D1'
    ];
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
    this.markers = [];
    this.markers.push(new marker(0,1,this.pitch*2,this.adsr,this.duration));

    for (var i=1; i<this.signature.beats; i++) {
        this.markers.push(new marker(beatLength*i,1,this.pitch,this.adsr,this.duration));
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


    // create clicks when our index matches a marker //
    l = this.markers.length;
    for (i=0; i<l; i++) {
        var marker = this.markers[i];
        if (index === (this.measureIndex + marker.time)) {
            //this.clicks.push( new MetroClick(this.clicks,marker.adsr,marker.pitch,marker.duration));
        }
    }


    // process any active clicks //
    l = this.clicks.length-1;
    for (i=l; i>=0; i--) {
        signal = this.clicks[i].process(signal,index);
    }

    return signal;
};



proto.getBeat = function() {
    return Math.round((sampleRate * 60) / this.bpm);
};


proto.randomBeat = function() {
    return tombola.item(this.beats);
};


proto.getMeasureIndex = function() {
    return this.measureIndex;
};


proto.millisecondsToSamples = function(ms) {
    return Math.round(ms*(sampleRate/1000));
};


proto.getBeatLength = function(time) {
    var beat = this.getBeat();
    var t = beat;

    switch (time) {

        // straight //
        case '64':
            t = beat/16;
            break;
        case '32':
            t = beat/8;
            break;
        case '16':
            t = beat/4;
            break;
        case '8':
            t = beat/2;
            break;
        case '4':
            t = beat;
            break;
        case '2':
            t = beat*2;
            break;
        case '1':
            t = beat*4;
            break;

        // triplets //
        case 'T64':
            t = (beat/8)/3;
            break;
        case 'T32':
            t = (beat/4)/3;
            break;
        case 'T16':
            t = (beat/2)/3;
            break;
        case 'T8':
            t = beat/3;
            break;
        case 'T4':
            t = (beat*2)/3;
            break;
        case 'T2':
            t = (beat*4)/3;
            break;
        case 'T1':
            t = (beat*8)/3;
            break;

        // quintuplets //
        case 'Q64':
            t = (beat/8)/5;
            break;
        case 'Q32':
            t = (beat/4)/5;
            break;
        case 'Q16':
            t = (beat/2)/5;
            break;
        case 'Q8':
            t = beat/5;
            break;
        case 'Q4':
            t = (beat*2)/5;
            break;
        case 'Q2':
            t = (beat*4)/5;
            break;
        case 'Q1':
            t = (beat*8)/5;
            break;

        // dotted //
        case 'D64':
            t = (beat/16)*1.5;
            break;
        case 'D32':
            t = (beat/8)*1.5;
            break;
        case 'D16':
            t = (beat/4)*1.5;
            break;
        case 'D8':
            t = (beat/2)*1.5;
            break;
        case 'D4':
            t = (beat)*1.5;
            break;
        case 'D2':
            t = (beat*2)*1.5;
            break;
        case 'D1':
            t = (beat*4)*1.5;
            break;
    }

    return Math.round(t);
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

// remove from parent object //
proto.kill = function() {
    var index = this.parentArray.indexOf(this);
    if (index > -1) {
        this.parentArray.splice(index, 1);
    }
};





module.exports = Clock;