
var utils = require('./lib/utils');
var RGBA = require('./lib/RGBA');

// COLORS //
var bgCols = [new RGBA(10,15,22,1)];
var graphCols = [new RGBA(235,26,76,1)];

// Drawing out waveforms of generated sounds for testing/analysis

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function DrawWave() {

    this.fullX = 3000;
    this.fullY = 1850;
    this.halfX = Math.round(this.fullX/2);
    this.halfY = Math.round(this.fullY/2);

    var u = (this.fullX);
    this.units = (u/910);

    // TEXT SIZES //
    this.headerType = Math.round(u/12);
    this.midType = Math.round(u/45);
    this.bodyType = Math.round(u/65);
    this.dataType = Math.round(u/82);
    this.subType = Math.round(u/100);

    var Canvas = require('canvas');
    this.canvas = new Canvas(this.fullX, this.fullY);
    this.cxa = this.canvas.getContext('2d');
}
var proto = DrawWave.prototype;


//-------------------------------------------------------------------------------------------
//  DRAW
//-------------------------------------------------------------------------------------------


proto.draw = function(data) {

    var cxa = this.cxa;
    var units = this.units;
    var halfX = this.halfX;
    var halfY = this.halfY;

    var waveWidth = this.fullX*0.8;

    // BG //
    color.fill(cxa,bgCols[0]);
    cxa.fillRect(0,0,this.fullX,this.fullY);


    // WAVE //
    color.stroke(cxa,graphCols[0]);
    cxa.lineWidth = 3;

    var dat = data[0];
    var l = dat.length;
    var spacer = 50;
    var div = waveWidth/l;


    var h = 100 * units;
    var x = halfX - (waveWidth/2);
    var y = halfY - (30 * units) - (h/2);

    cxa.beginPath();
    cxa.moveTo(x,y + (dat[0] * h));


    for (var i=spacer; i<l; i+=spacer) {
        cxa.lineTo(x + (div*i),y + (dat[i] * h));
    }

    cxa.stroke();

    var datUrl = this.canvas.toDataURL();
    console.log(datUrl);
};