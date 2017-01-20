var feedback = require('./Feedback');
var lowPass = require('./LowPass');

// Attempt at roughly recreating RetroDelay vst plugin

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------

function RetroDelay() {
    this.filter = new lowPass.mono();
}

RetroDelay.prototype.process = function(input,time,feedBack,cutoff,res,channel,index) {
    var t = this.calculateTime(time);
    var delay = feedback.mono(1,t,channel,index);
    return this.filter.process(cutoff,res,delay);
};

RetroDelay.prototype.calculateTime = function(time) {
    var beat = audioClock.getBeat();
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
    }

    return Math.round(t);
};


//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------

function StereoRetroDelay() {
    this.d1 = new RetroDelay();
    this.d2 = new RetroDelay();
}

StereoRetroDelay.prototype.process = function(signal,mix,leftTime,rightTime,feedback,cutoff,res,channel,index) {
    return [
        (signal[0] * (1-mix)) + (this.d1.process(signal[0],leftTime,feedback,cutoff,res,channel[1],index) * mix),
        (signal[1] * (1-mix)) + (this.d2.process(signal[1],rightTime,feedback,cutoff,res,channel[0],index) * mix)
    ];
};


module.exports = {
    mono: RetroDelay,
    stereo: StereoRetroDelay
};