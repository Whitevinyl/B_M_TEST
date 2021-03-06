var marker = require('../core/Marker');
var Tombola = require('tombola');
var tombola = new Tombola();

//-------------------------------------------------------------------------------------------
//  PLAYER
//-------------------------------------------------------------------------------------------

function SamplePlayer() {
    this.samples = [];
    this.markers = [];

    for (var i=0; i<6; i++) {
        this.markers.push(new marker(audioClock.getBeatLength('D8')*i,1,this.pitch*2,this.adsr,this.duration));
    }
}
var proto = SamplePlayer.prototype;



proto.process = function(signal,level,index) {
    var l,i;

    // add sample if we hit a marker //
    l = this.markers.length;
    for (i=0; i<l; i++) {
        var marker = this.markers[i];
        if (index === (audioClock.getMeasureIndex() + marker.time)) {
            this.samples.push( new Sample(this.samples,marker.adsr,marker.pitch,marker.duration));
        }
    }

    // process any active samples //
    l = this.samples.length-1;
    for (i=l; i>=0; i--) {
        signal = this.samples[i].process(signal,level);
    }

    return signal;
};



//-------------------------------------------------------------------------------------------
//  SHOT
//-------------------------------------------------------------------------------------------



function Sample(parentArray) {
    this.parentArray = parentArray;
    this.sample = mySample;
    this.index = 0;
    this.speed = frequencyToRatio(440,frequencyFromInterval(tombola.item([ /*-24,-21,-19,-17,-14,*/ -12,-9,-7, -5,-2,0,3,5,7,10,12, 15,17,19,22,24])));
    var r = this.speed/(sampleRate*10);
    this.drift = tombola.rangeFloat(-r,r);
}
proto = Sample.prototype;



proto.process = function(signal,level) {
    this.index += this.speed;
    //this.speed += this.drift;

    // get indices //
    var ind = Math.round(this.index);
    var baseIndex = Math.floor(this.index);
    var diff = this.index - baseIndex;


    // kill if we're done playing sample //
    if (ind>=(this.sample[0].length + 1000) || ind<0) {
        this.kill();
    }


    // allow for zeroed samples at end //
    var sampleA = [0,0];
    var sampleB = [0,0];

    if (this.sample[0][baseIndex]) {
        sampleA = [this.sample[0][baseIndex],this.sample[1][baseIndex]];
    }
    if (this.sample[0][baseIndex + 1]) {
        sampleB = [this.sample[0][baseIndex + 1],this.sample[1][baseIndex + 1]];
    }

    // create interpolated sample //
    var newSample = [
        (sampleA[0] * (1-diff)) + (sampleB[0] * diff),
        (sampleA[1] * (1-diff)) + (sampleB[1] * diff)
    ];





    /*return [
        signal[0] + (this.sample[0][ind]*level),
        signal[1] + (this.sample[1][ind]*level)
    ];*/
    return [
        signal[0] + (newSample[0]*level),
        signal[1] + (newSample[1]*level)
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





function frequencyFromInterval(interval) {
    return 440 * Math.pow(1.059463094359,interval);
}

function frequencyToRatio(root,frequency) {
    return (frequency/root);
}


module.exports = SamplePlayer;
