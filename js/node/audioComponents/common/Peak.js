
// get average power of a signal with a memory window

//-------------------------------------------------------------------------------------------
//  MONO INIT
//-------------------------------------------------------------------------------------------

function Peak() {
    this.memory = [];
}

//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------

Peak.prototype.process = function(signal,size) {


    // add signal to memory //
    this.memory.push(signal);


    // trim memory to size window //
    while (this.memory.length>size) {
        this.memory.shift();
    }


    // get peak average //
    var l = this.memory.length;
    var total = 0;
    for (var i=0; i<l; i++) {
        total += this.memory[i];
    }


    // calculate & return average //
    return total/l;

};

//-------------------------------------------------------------------------------------------
//  STEREO INIT
//-------------------------------------------------------------------------------------------

function StereoPeak() {
    this.memory = [];
}

//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

StereoPeak.prototype.process = function(signal,size) {


    // add signal to memory //
    this.memory.push(signal);


    // trim memory to size window //
    while (this.memory.length>size) {
        this.memory.shift();
    }


    // get peak average //
    var l = this.memory.length;
    var totalL = 0;
    var totalR = 0;
    for (var i=0; i<l; i++) {
        totalL += this.memory[i][0];
        totalR += this.memory[i][1];
    }

    // calculate & return peak //
    return Math.max(totalL/l, totalR/l)
};

module.exports = {
    mono: Peak,
    stereo: StereoPeak
};

