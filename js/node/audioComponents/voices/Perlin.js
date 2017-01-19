
var Simplex = require('perlin-simplex');

// Experimental perlin noise voice

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Perlin() {
    this.simplex = new Simplex();
    this.i = 0;
}

//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

Perlin.prototype.process = function(frequency) {
    /*var xoff = this.i/frequency;
    this.i++;
    return  this.simplex.noise(xoff,0);*/


    this.i += frequency/sampleRate;
    return  this.simplex.noise(this.i,0);

};

module.exports = Perlin;
