var utils = require('../../lib/utils');
var Tombola = require('tombola');
var tombola = new Tombola();

var common = require('../common/Common');
var timeSignature = require('../TimeSignature');

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Clock() {
    this.bpm = tombola.range(40,120);
    this.signature = new timeSignature(4,4);

    this.markers = [];
    this.a = 0;
    this.envelope = new common.ADSREnvelope();
}
var proto = Clock.prototype;





module.exports = Clock;