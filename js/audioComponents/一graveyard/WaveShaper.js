var utils = require('../../lib/utils');

// Waveshaping distortion effect:
// http://www.musicdsp.org/showArchiveComment.php?ArchiveID=46

//-------------------------------------------------------------------------------------------
//  MONO
//-------------------------------------------------------------------------------------------


function waveShaper(input,amount,curve) {
    curve = utils.arg(curve,0);
    var out = input;

    switch (curve) {

        case 0:
            // hard mulispike peaks //
            var k = 2*amount/(1-amount);
            out = (1+k)*out/(1+k*Math.abs(out));
            break;


        case 1:
            // sine peaks //
            out = 1.5 * out - 0.5 * out * out * out;
            break;


        case 2:
            // sine peaks //
            out = out * 0.686306;
            var a = 1 + Math.exp(Math.sqrt(Math.abs(out)) * -0.75);
            if (out > 0) {
                out = (Math.exp(out) - Math.exp(-out * a)) / (Math.exp(out) + Math.exp(-out));
            } else {
                out = -((Math.exp(-out) - Math.exp(out * a)) / (Math.exp(-out) + Math.exp(out)));
            }
            out *= (0.686306/(0.686306 * 0.686306));
            break;


        case 3:
            // stepped wave staggering (the Batman) //
            var t = amount * sign(out);
            var s = 1;
            out = out + ( (( (t + (1-t)) - (out * sign(out))) / s) * (out % t) ) ;
            break;


        case 4:
            // stepped screamer (Machu Picchu) //
            var t = amount * sign(out);
            var s = 1;
            out = out - ( (((t + (1-t)) - (out * sign(out))) / s) * (out % t) );
            break;


        case 5:
            // robotic //
            var t = amount * sign(out);
            var s = 8;
            out = out - ( (((t + (1-t)) - (-out * sign(out))) / s) * (out % t) );
            break;


        case 6:
            // square peaks //
            var t = amount * sign(out);
            var s = 0.5; // 0 - 1
            out = out - ( ((out - t) / (2-s)) * (Math.abs(out) > amount) );
            var r = 1 - ((1-amount) / (2-s));
            out *= (r/(r*r));
            break;

    }

    return out;
}


function sign(x) {
    if (x > 0) { return 1; }
    else { return -1; }
}

//-------------------------------------------------------------------------------------------
//  STEREO
//-------------------------------------------------------------------------------------------

function stereoWaveShaper(signal,amount,curve,mix) {
    mix = utils.arg(mix,1);
    return [
        (signal[0] * (1 - mix)) + (waveShaper(signal[0],amount,curve) * mix),
        (signal[1] * (1 - mix)) + (waveShaper(signal[1],amount,curve) * mix)
    ];
}


module.exports = stereoWaveShaper;