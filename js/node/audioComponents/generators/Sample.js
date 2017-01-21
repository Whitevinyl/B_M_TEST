var marker = require('../core/Marker');


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
}
proto = Sample.prototype;



proto.process = function(signal,level) {
    this.index++;
    if (this.index>=this.sample[0].length) {
        this.kill();
    }

    return [
        signal[0] + (this.sample[0][this.index]*level),
        signal[1] + (this.sample[1][this.index]*level)
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


module.exports = SamplePlayer;
