var marker = require('../core/Marker');
var Tombola = require('tombola');
var tombola = new Tombola();

//-------------------------------------------------------------------------------------------
//  PLAYER
//-------------------------------------------------------------------------------------------

function SamplePlayer() {
    this.samples = [];
    this.markers = [];
    this.markers.push(new marker(0,1,this.pitch*2,this.adsr,this.duration));
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
    this.speed = frequencyToRatio(440,frequencyFromInterval(tombola.item([0,3,5,7,10,12])));
    var r = this.speed/20000;
    this.adjust = tombola.rangeFloat(-r,r);
}
proto = Sample.prototype;



proto.process = function(signal,level) {
    this.index += this.speed;
    //this.speed += this.adjust;
    var ind = Math.round(this.index);
    if (ind>=this.sample[0].length || ind<0) {
        this.kill();
    }

    return [
        signal[0] + (this.sample[0][ind]*level),
        signal[1] + (this.sample[1][ind]*level)
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
