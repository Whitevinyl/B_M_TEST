var utils = require('../../lib/utils');
var common = require('../common/Common');
var Tombola = require('tombola');
var tombola = new Tombola();

var Resonant = require('./../filters/Resonant');

// first attempt at a looping buffer delay


//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Shuffle() {
    this.memory = [[],[]];
    this.index = 0;
}
var proto = Shuffle.prototype;


//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function (signal,delay,speed,mix) {

    // convert speed from interval //
    speed = (utils.intervalToRatio(speed)-1);

    this.memory[0].push(signal[0]);
    this.memory[1].push(signal[1]);

    var l = this.memory[0].length;
    if (l>1) {

        // trim memory buffer length //
        while (this.memory[0].length > delay) {
            this.memory[0].shift();
            this.memory[1].shift();
        }
        this.crossFade(100);

        l = this.memory[0].length;
        if (this.index >= l) {
            this.index = tombola.range(0,l-1);
        }


        var i = Math.round(this.index);
        /*var out = [
            this.memory[0][i],
            this.memory[1][i]
        ];*/

        //console.log(out);
        //console.log(this.index);
        out = common.interpolate(this.memory,this.index);

        this.index += speed;

        return [
            (signal[0] * (1-mix)) + (out[0] * mix),
            (signal[1] * (1-mix)) + (out[1] * mix)
        ];
    }

    return signal;
};


//-------------------------------------------------------------------------------------------
//  CREATE CROSSFADE
//-------------------------------------------------------------------------------------------

proto.crossFade = function(fade) {

    var buffer = this.memory;
    var length = buffer[0].length-1;

    if (length > fade) {

        for (var i=0; i<fade; i++) {
            var mix = (i/fade);
            var i2 = length - (fade+1) + i;
            buffer[0][i] = (buffer[0][i] * (1-mix)) + (buffer[0][i2] * mix);
            buffer[1][i] = (buffer[1][i] * (1-mix)) + (buffer[1][i2] * mix);
        }

    }
};


module.exports = Shuffle;