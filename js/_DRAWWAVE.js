var fs = require('fs');
var utils = require('./lib/utils');
var RGBA = require('./lib/RGBA');

// COLORS //
var bgCols = [new RGBA(10,15,22,1)];
var graphCols = [new RGBA(235,26,76,1),new RGBA(50,48,50,1)];

// Drawing out waveforms of generated sounds for testing/analysis

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function DrawWave() {

    this.fullX = 2500;
    this.fullY = 700;
    this.halfX = Math.round(this.fullX/2);
    this.halfY = Math.round(this.fullY/2);

    var u = (this.fullY);
    this.units = (u/500);

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

    var waveWidth = this.fullX - (2*units);

    // BG //
    color.fill(cxa,bgCols[0]);
    cxa.fillRect(0,0,this.fullX,this.fullY);



    cxa.lineWidth = 2;
    var dat = data[0];
    var l = dat.length;
    var spacer = Math.floor(l/9000);
    var div = waveWidth/l;

    var h = 100 * units;
    var x = halfX - (waveWidth/2);
    var y = halfY - (10 * units) - (h);

    var seconds = l/sampleRate;
    var tenths = l/(sampleRate/10);
    var hundredths = l/(sampleRate/100);
    var i, mx, marks;


    // MARKS //
    color.stroke(cxa,graphCols[1]);

    if (seconds>4) {

        cxa.lineWidth = 2;
        cxa.beginPath();
        marks = Math.floor(seconds);
        for (i=0; i<=marks; i++) {
            mx = units + ((waveWidth/seconds) * i);
            cxa.moveTo(mx,halfY - (10*units));
            cxa.lineTo(mx,halfY + (10*units));
        }
        cxa.stroke();

    }
    else {

        cxa.lineWidth = 1;
        cxa.beginPath();
        marks = Math.floor(hundredths);
        for (i=0; i<=marks; i++) {
            mx = units + ((waveWidth/hundredths) * i);
            cxa.moveTo(mx,halfY - (2*units));
            cxa.lineTo(mx,halfY + (2*units));
        }
        cxa.stroke();


        cxa.lineWidth = 2;
        cxa.beginPath();
        marks = Math.floor(tenths);
        for (i=0; i<=marks; i++) {
            mx = units + ((waveWidth/tenths) * i);
            cxa.moveTo(mx,halfY - (10*units));
            cxa.lineTo(mx,halfY + (10*units));
        }
        cxa.stroke();

    }





    // WAVE //
    color.stroke(cxa,graphCols[0]);
    cxa.beginPath();

    // L //
    cxa.moveTo(x,y + (dat[0] * h));
    for (i=spacer; i<l; i+=spacer) {
        cxa.lineTo(x + (div*i),y + (dat[i] * h));
    }

    // R //
    dat = data[1];
    y = halfY + (10 * units) + (h);
    cxa.moveTo(x,y + (dat[0] * h));
    for (i=spacer; i<l; i+=spacer) {
        cxa.lineTo(x + (div*i),y + (dat[i] * h));
    }
    cxa.stroke();




    var datUrl = this.canvas.toDataURL('image/png');
    var base64Data  =   datUrl.replace(/^data:image\/png;base64,/, "");
    base64Data  +=  base64Data.replace('+', ' ');
    var bin = new Buffer(base64Data, 'base64').toString('binary');
    fs.writeFile("wave.png", bin, 'binary', function(err) {
        console.log(err);
    });
};

module.exports = DrawWave;