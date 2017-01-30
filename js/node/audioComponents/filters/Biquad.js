var utils = require('../../lib/utils');
var common = require('../common/Common');

// Multi-type Biquad filter, adapted from: http://wavepot.com/opendsp/biquad
// and originally from: http://mohayonao.github.io/timbre.js/

// lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass

//-------------------------------------------------------------------------------------------
//  MONO INIT
//-------------------------------------------------------------------------------------------

function Biquad() {
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
    this.b0 = this.b1 = this.b2 = this.a1 = this.a2 = 0;
}

var proto = Biquad.prototype;


//-------------------------------------------------------------------------------------------
//  MONO PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(input, type, frequency, Q, gain) {

    this.filter(type,frequency,Q,gain);

    var x1 = this.x1, x2 = this.x2, y1 = this.y1, y2 = this.y2;
    var b0 = this.b0, b1 = this.b1, b2 = this.b2, a1 = this.a1, a2 = this.a2;

    var y = b0 * input + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    this.x2 = x1; this.x1 = input; this.y2 = y1; this.y1 = y;

    return y;
};


//-------------------------------------------------------------------------------------------
//  TYPE FILTERING PROCESS
//-------------------------------------------------------------------------------------------


proto.filter = function(type, frequency, Q, gain) {

    var g, d, sn, alpha, beta, gamma, theta;
    var w0, ia0, k, k2, A, S, aPlusOne, aMinusOne;

    switch (type) {

        case 'lowpass':

            frequency /= (sampleRate * 0.5);

            if (frequency >= 1) {
                this.b0 = 1;
                this.b1 = this.b2 = this.a1 = this.a2 = 0;
            } else if (frequency <= 0) {
                this.b0 = this.b1 = this.b2 = this.a1 = this.a2 = 0;
            } else {
                Q = (Q < 0) ? 0 : Q;
                g = Math.pow(10.0, 0.05 * Q);
                d = Math.sqrt((4 - Math.sqrt(16 - 16 / (g * g))) * 0.5);

                theta = Math.PI * frequency;
                sn = 0.5 * d * Math.sin(theta);
                beta = 0.5 * (1 - sn) / (1 + sn);
                gamma = (0.5 + beta) * Math.cos(theta);
                alpha = 0.25 * (0.5 + beta - gamma);

                this.b0 = 2 * alpha;
                this.b1 = 4 * alpha;
                this.b2 = this.b0; // 2 * alpha;
                this.a1 = 2 * -gamma;
                this.a2 = 2 * beta;
            }

            break;

        case 'highpass':

            frequency /= (sampleRate * 0.5);
            if (frequency >= 1) {
                this.b0 = this.b1 = this.b2 = this.a1 = this.a2 = 0;
            } else if (frequency <= 0) {
                this.b0 = 1;
                this.b1 = this.b2 = this.a1 = this.a2 = 0;
            } else {
                Q = (Q < 0) ? 0 : Q;

                g = Math.pow(10.0, 0.05 * Q);
                d = Math.sqrt((4 - Math.sqrt(16 - 16 / (g * g))) / 2);

                theta = Math.PI * frequency;
                sn = 0.5 * d * Math.sin(theta);
                beta = 0.5 * (1 - sn) / (1 + sn);
                gamma = (0.5 + beta) * Math.cos(theta);
                alpha = 0.25 * (0.5 + beta + gamma);

                this.b0 = 2 * alpha;
                this.b1 = -4 * alpha;
                this.b2 = this.b0; // 2 * alpha;
                this.a1 = 2 * -gamma;
                this.a2 = 2 * beta;
            }

            break;

        case 'bandpass':

            frequency /= (sampleRate * 0.5);
            if (frequency > 0 && frequency < 1) {
                if (Q > 0) {
                    w0 = Math.PI * frequency;

                    alpha = Math.sin(w0) / (2 * Q);
                    k = Math.cos(w0);

                    ia0 = 1 / (1 + alpha);

                    this.b0 = alpha * ia0;
                    this.b1 = 0;
                    this.b2 = -alpha * ia0;
                    this.a1 = -2 * k * ia0;
                    this.a2 = (1 - alpha) * ia0;
                } else {
                    this.b0 = this.b1 = this.b2 = this.a1 = this.a2 = 0;
                }
            } else {
                this.b0 = this.b1 = this.b2 = this.a1 = this.a2 = 0;
            }

            break;

        case 'lowshelf':

            frequency /= (sampleRate * 0.5);

            A = Math.pow(10.0, gain / 40);

            if (frequency >= 1) {
                this.b0 = A * A;
                this.b1 = this.b2 = this.a1 = this.a2 = 0;
            } else if (frequency <= 0) {
                this.b0 = 1;
                this.b1 = this.b2 = this.a1 = this.a2 = 0;
            } else {
                w0 = Math.PI * frequency;
                S = 1; // filter slope (1 is max value)
                alpha = 0.5 * Math.sin(w0) * Math.sqrt((A + 1 / A) * (1 / S - 1) + 2);
                k = Math.cos(w0);
                k2 = 2 * Math.sqrt(A) * alpha;
                aPlusOne = A + 1;
                aMinusOne = A - 1;

                ia0 = 1 / (aPlusOne + aMinusOne * k + k2);

                this.b0 = (A * (aPlusOne - aMinusOne * k + k2)) * ia0;
                this.b1 = (2 * A * (aMinusOne - aPlusOne * k)) * ia0;
                this.b2 = (A * (aPlusOne - aMinusOne * k - k2)) * ia0;
                this.a1 = (-2 * (aMinusOne + aPlusOne * k)) * ia0;
                this.a2 = (aPlusOne + aMinusOne * k - k2) * ia0;
            }

            break;

        case 'highshelf':

            frequency /= (sampleRate * 0.5);

            A = Math.pow(10.0, gain / 40);

            if (frequency >= 1) {
                this.b0 = 1;
                this.b1 = this.b2 = this.a1 = this.a2 = 0;
            } else if (frequency <= 0) {
                this.b0 = A * A;
                this.b1 = this.b2 = this.a1 = this.a2 = 0;
            } else {
                w0 = Math.PI * frequency;
                S = 1; // filter slope (1 is max value)
                alpha = 0.5 * Math.sin(w0) * Math.sqrt((A + 1 / A) * (1 / S - 1) + 2);
                k = Math.cos(w0);
                k2 = 2 * Math.sqrt(A) * alpha;
                aPlusOne = A + 1;
                aMinusOne = A - 1;

                ia0 = 1 / (aPlusOne - aMinusOne * k + k2);

                this.b0 = (A * (aPlusOne + aMinusOne * k + k2)) * ia0;
                this.b1 = (-2 * A * (aMinusOne + aPlusOne * k)) * ia0;
                this.b2 = (A * (aPlusOne + aMinusOne * k - k2)) * ia0;
                this.a1 = (2 * (aMinusOne - aPlusOne * k)) * ia0;
                this.a2 = (aPlusOne - aMinusOne * k - k2) * ia0;
            }

            break;

        case 'peaking':

            frequency /= (sampleRate * 0.5);

            if (frequency > 0 && frequency < 1) {
                A = Math.pow(10.0, gain / 40);
                if (Q > 0) {
                    w0 = Math.PI * frequency;
                    alpha = Math.sin(w0) / (2 * Q);
                    k = Math.cos(w0);
                    ia0 = 1 / (1 + alpha / A);

                    this.b0 = (1 + alpha * A) * ia0;
                    this.b1 = (-2 * k) * ia0;
                    this.b2 = (1 - alpha * A) * ia0;
                    this.a1 = this.b1; // (-2 * k) * ia0;
                    this.a2 = (1 - alpha / A) * ia0;
                } else {
                    this.b0 = A * A;
                    this.b1 = this.b2 = this.a1 = this.a2 = 0;
                }
            } else {
                this.b0 = 1;
                this.b1 = this.b2 = this.a1 = this.a2 = 0;
            }

            break;

        case 'notch':

            frequency /= (sampleRate * 0.5);

            if (frequency > 0 && frequency < 1) {
                if (Q > 0) {
                    w0 = Math.PI * frequency;
                    alpha = Math.sin(w0) / (2 * Q);
                    k = Math.cos(w0);
                    ia0 = 1 / (1 + alpha);

                    this.b0 = ia0;
                    this.b1 = (-2 * k) * ia0;
                    this.b2 = ia0;
                    this.a1 = this.b1; // (-2 * k) * ia0;
                    this.a2 = (1 - alpha) * ia0;
                } else {
                    this.b0 = this.b1 = this.b2 = this.a1 = this.a2 = 0;
                }
            } else {
                this.b0 = 1;
                this.b1 = this.b2 = this.a1 = this.a2 = 0;
            }

            break;

        case 'allpass':

            frequency /= (sampleRate * 0.5);

            if (frequency > 0 && frequency < 1) {
                if (Q > 0) {
                    w0 = Math.PI * frequency;
                    alpha = Math.sin(w0) / (2 * Q);
                    k = Math.cos(w0);
                    ia0 = 1 / (1 + alpha);

                    this.b0 = (1 - alpha) * ia0;
                    this.b1 = (-2 * k) * ia0;
                    this.b2 = (1 + alpha) * ia0;
                    this.a1 = this.b1; // (-2 * k) * ia0;
                    this.a2 = this.b0; // (1 - alpha) * ia0;
                } else {
                    this.b0 = -1;
                    this.b1 = this.b2 = this.a1 = this.a2 = 0;
                }
            } else {
                this.b0 = 1;
                this.b1 = this.b2 = this.a1 = this.a2 = 0;
            }

            break;
    }
};


//-------------------------------------------------------------------------------------------
//  STEREO INIT
//-------------------------------------------------------------------------------------------


function StereoBiquad() {
    this.bq1 = new Biquad();
    this.bq2 = new Biquad();
}

proto = StereoBiquad.prototype;


//-------------------------------------------------------------------------------------------
//  STEREO PROCESS
//-------------------------------------------------------------------------------------------

proto.process = function(signal, type, frequency, Q, gain) {
    return [
        this.bq1.process(signal[0],type,frequency,Q,gain),
        this.bq2.process(signal[1],type,frequency,Q,gain)
    ];
};



module.exports = {
    mono: Biquad,
    stereo: StereoBiquad
};