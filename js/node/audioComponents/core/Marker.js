//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function Marker(time,velocity,pitch,adsr,duration) {
    this.time = time;
    this.velocity = velocity || 1;
    this.pitch = pitch || 220;
    this.adsr = adsr || [0,0,1,0];
    this.duration = duration || sampleRate;
}

module.exports = Marker;
