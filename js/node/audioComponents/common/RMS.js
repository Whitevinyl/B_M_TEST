
// get average power of a signal with a memory window

//-------------------------------------------------------------------------------------------
//  MONO INIT
//-------------------------------------------------------------------------------------------

function RMS() {
    this.memory = [];
}

//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------

RMS.prototype.process = function(signal,size) {


    // add signal to memory //
    this.memory.push(signal);


    // trim memory to size window //
    while (this.memory.length>size) {
        this.memory.shift();
    }


    // get squares //
    var l = this.memory.length;
    var squares = 0;
    for (var i=0; i<l; i++) {
        var x = this.memory[i];
        squares += (x*x);
    }


    // calculate & return RMS //
    return Math.sqrt(squares/l);

};

//-------------------------------------------------------------------------------------------
//  STEREO INIT
//-------------------------------------------------------------------------------------------

function StereoRMS() {
    this.memory = [];
}

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

StereoRMS.prototype.process = function(signal,size) {


    // add signal to memory //
    this.memory.push(signal);


    // trim memory to size window //
    while (this.memory.length>size) {
        this.memory.shift();
    }


    // get squares //
    var l = this.memory.length;
    var squares = 0;
    for (var i=0; i<l; i++) {
        var x;
        x = this.memory[i][0];
        squares += (x*x);
        x = this.memory[i][1];
        squares += (x*x);
    }

    // calculate & return RMS //
    return Math.sqrt(squares/l);

};

module.exports = {
    mono: RMS,
    stereo: StereoRMS
};
