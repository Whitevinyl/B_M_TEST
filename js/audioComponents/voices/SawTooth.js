
// A simple sawtooth wave voice

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------


function SawTooth() {
    this.a = 1;
}
var proto = SawTooth.prototype;


//-------------------------------------------------------------------------------------------
//  PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(frequency) {

    // update voice value //
    this.a -= (frequency * (2/sampleRate));

    // stay within amplitude bounds & refresh//
    var spill = 0;
    if (this.a < -1) {
        spill = this.a + 1;
        this.a = (1 - spill);
    }
    return this.a;
};


module.exports = SawTooth;