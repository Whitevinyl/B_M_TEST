var feedback = require('./Feedback');
var lowPass = require('./LowPass');
var distortion = require('./FoldBackII');
var distortion2 = require('./Invert');
var distortion3 = require('./Erode');

// Attempt at roughly recreating RetroDelay vst plugin

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------

function RetroDelay() {
    this.filter = new lowPass.mono();
}

RetroDelay.prototype.process = function(input,time,feedBack,cutoff,res,channel,index) {
    var t = audioClock.getBeatLength(time);
    var delay = feedback.mono(1,t,channel,index,feedBack,input);
    var drive = [delay,delay];
    //drive = distortion(drive,0.01,0.3);
    //drive = distortion2(drive,0.05,0.4);
    //drive = distortion3(drive,200,index,0.7);
    return this.filter.process(cutoff,res,drive[0]);
};


//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------

function StereoRetroDelay(l) {
    this.d1 = new RetroDelay();
    this.d2 = new RetroDelay();
    this.channel = [new Float32Array(l),new Float32Array(l)];
}

StereoRetroDelay.prototype.process = function(signal,mix,leftTime,rightTime,feedback,cutoff,res,channel,index) {
    /*return [
        (signal[0] * (1-mix)) + (this.d1.process(leftTime,feedback,cutoff,res,channel[1],index) * mix),
        (signal[1] * (1-mix)) + (this.d2.process(rightTime,feedback,cutoff,res,channel[0],index) * mix)
    ];*/

    this.channel[0][index] = this.d1.process(this.channel[0],leftTime,feedback,cutoff,res,channel[1],index) * mix;
    this.channel[1][index] = this.d2.process(this.channel[1],rightTime,feedback,cutoff,res,channel[0],index) * mix;

    return signal;
};


module.exports = {
    mono: RetroDelay,
    stereo: StereoRetroDelay
};