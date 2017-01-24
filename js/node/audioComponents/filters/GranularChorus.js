var utils = require('../../lib/utils');
var common = require('../common/Common');

var Repeater = require('../common/Repeater');

//-------------------------------------------------------------------------------------------
//  PLAYER INIT
//-------------------------------------------------------------------------------------------


function GranularChorus() {
    this.memory = [[],[]];
    /*var a = [];
    var b = [];
    this.memory.push(a);
    this.memory.push(b);*/
    this.playHead = 1;
}
var proto = GranularChorus.prototype;


//-------------------------------------------------------------------------------------------
//  PLAYER PROCESS
//-------------------------------------------------------------------------------------------


proto.process = function(signal,effect,mix) {
    effect = utils.valueInRange(effect,0,5);

    // record to sample buffer for later //
    this.memory[0].push(signal[0]);
    this.memory[1].push(signal[1]);

    // we have enough buffer - let's go //
    var bufferLength = Math.round(effect*3000);
    if (this.memory[0].length>bufferLength) {

        // trim memory buffer length //
        while (this.memory[0].length > (bufferLength*1.4)) {
            this.memory[0].shift();
            this.memory[1].shift();
        }


        // update playhead //
        this.playHead += (effect*0.1);
        var refresh = Math.floor((bufferLength-1) * 0.5);
        if (this.playHead >= (refresh)) {
            this.writeFade(refresh-1);
            this.playHead = 1;
        }

        // get sample //
        var sample = common.interpolate(this.memory,this.playHead);

        // mix //
        signal = [
            (signal[0] * (1-mix)) + (sample[1]*mix),
            (signal[1] * (1-mix)) + (sample[0]*mix)
        ];
    }

    return signal;
};


proto.writeFade = function(readIndex) {
    var fade = 1;
    var fadeLength = readIndex-1;
    for (var h=0; h<fadeLength; h++) {
        fade = (1 - (h / fadeLength));

        this.memory[0][h] = (this.memory[0][h] * (1-fade)) + (this.memory[0][readIndex + h] * fade);
        this.memory[1][h] = (this.memory[1][h] * (1-fade)) + (this.memory[1][readIndex + h] * fade);
    }
    /*this.memory[0][0] = this.memory[0][readIndex];
    this.memory[1][0] = this.memory[1][readIndex];*/
};


module.exports = GranularChorus;
