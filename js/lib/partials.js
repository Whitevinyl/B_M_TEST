
var utils = require('./utils');
var Tombola = require('tombola');
var tombola = new Tombola();

// A bunch of partial filtering functions I wrote for some web audio experiments with
// 'Harmonic Evolver' repurposed for use with the 'harmonic sine' here. bot specific filters
// are at the bottom of the page.

//-------------------------------------------------------------------------------------------
//  SET PARTIALS
//-------------------------------------------------------------------------------------------

function setPartials(type,length) {
    // ZERO OUR PARTIALS ARRAY //
    var partials = [];
    length = length || 30;
    for (var i=0; i<length; i++) {
        partials.push(0);
    }

    partials = mode(partials,type);

    filterNormalise(partials,length);
    return partials;
}

function randomPartials(width) {

    // ZERO OUR PARTIALS ARRAY //
    var partials = [];
    for (var i=0; i<width; i++) {
        partials.push(0);
    }

    var min = Math.ceil(width*0.5);

    // VARY HOW MUCH OF THE ARRAY WE ACTUALLY USE //
    var length = Math.round(min + (Math.random()*(width - min)));

    partials = modeRandom(partials,length);
    filterNormalise(partials,width);
    return partials;
}

//-------------------------------------------------------------------------------------------
//  ALGORITHM MODES
//-------------------------------------------------------------------------------------------

function modeRandom(partials,length) {

    // randomly select algorithm type //
    var type = Math.floor(Math.random()*14);
    //console.log(type);

    modes[type](partials,length);
    return partials;
}

var modes = [
    organ,
    warmBuzz,
    buzz,
    softBuzz,
    softBuzzRing,
    lows,
    random,
    buzzChirp,
    metallicChirp,
    metallicRing,
    glass,
    metallicBuzz,
    metallicReed,
    tubular
];


//-------------------------------------------------------------------------------------------
//  TYPES / MULTI FILTERS
//-------------------------------------------------------------------------------------------


// ORGAN //
function organ(partials,length) {
    filterGrow(partials,length,0.05);
    filter1OverSquared(partials,length);
    filterLowPass(partials,length,0.1,0);
    filterOrganise(partials,length,0.4);
}

// WARM BUZZ //
function warmBuzz(partials,length) {
    filter1Over(partials,length);
    filter1OverSquared(partials,length);
}

// BUZZ //
function buzz(partials,length) {
    filter1Over(partials,length);
    filterGrow(partials,length,Math.random()*0.05);
}

// SOFT BUZZ //
function softBuzz(partials,length) {
    filter1OverSquared(partials,length);
    filterGrow(partials,length,Math.random()*0.05);
}

// SOFT BUZZ RING //
function softBuzzRing(partials,length) {
    filterGrow(partials,length,0.05);
    filter1Over(partials,length);
    filterDisorganise(partials,length,0.4,5);
    filterLowPass(partials,length,0.3,0);
}

// LOWS //
function lows(partials,length) {
    filterGrow(partials,length,0.1 + (Math.random()*0.5));
    filterLowPass(partials,length,1,0);
}

// RANDOM //
function random(partials,length) {
    filterRandomiseAll(partials,length);
}

// BUZZ CHIRP //
function buzzChirp(partials,length) {
    filterRandomiseAll(partials,length);
    filterHighPass(partials,length,1,0);
    filter1Over(partials,length);
    filter1OverSquared(partials,length);
}

// METALLIC CHIRP //
function metallicChirp(partials,length) {
    filterGrow(partials,length,0.05);
    filterLowPass(partials,length,0.1,0);
    filterDisorganise(partials,length,0.4,2);
}

// METALLIC RING //
function metallicRing(partials,length) {
    filterGrow(partials,length,0.05);
    filterDisorganise(partials,length,0.4,3);
    filterLowPass(partials,length,0.1,0);
}

// GLASS //
function glass(partials,length) {
    filterDisorganise(partials,length,0.4,2);
    filterHighPass(partials,length,1,0);
    filterIndexMatchPeak(partials,length,1,1);
}

// METALLIC BUZZ //
function metallicBuzz(partials,length) {
    filterLowPass(partials,length,1,1);
    filterZeroMultiple(partials,length,2);
}

// METALLIC REED //
function metallicReed(partials,length) {
    filterLowPass(partials,length,1,1);
    filterZeroInterval(partials,length,3,1);
}

// TUBULAR //
function tubular(partials,length) {
    filterPeakInterval(partials,length,4,0,1);
    filterLowPass(partials,length,0.8,0);
}


//-------------------------------------------------------------------------------------------
//  ALGORITHM FILTERS
//-------------------------------------------------------------------------------------------

function filterRandomiseAll(partials,length) {
    for (var i=0; i<length; i++) {
        partials[i] = Math.random();
    }
}

function filterErode(partials,length,strength) {
    for (var i=0; i<length; i++) {
        partials[i] -= (Math.random()*strength);
    }
}

function filterGrow(partials,length,strength) {
    for (var i=0; i<length; i++) {
        partials[i] += (Math.random()*strength);
    }
}

function filterRandomPeaks(partials,length,maxPeaks) {
    var peakNo = Math.ceil(Math.random()*maxPeaks);
    var peaks = [];
    for (var i=0; i<peakNo; i++) {
        peaks.push(Math.floor(Math.random()*length));
    }
    for (i=0; i<peaks.length; i++) {
        partials[peaks[i]] += (0.5 + (Math.random()*0.5));
    }
}

function filterPeakSwell(partials,length,maxWidth) {
    var peakCenter = Math.floor(Math.random()*length);
    var peakWidth = 1 + Math.round(Math.random()*maxWidth);
    partials[peakCenter] = 1;
    for (var i=1; i<=peakWidth; i++) {
        if ((peakCenter - i)>0) {
            partials[peakCenter - i] += ((1/(peakWidth+1))*((peakWidth + 1) - i));
        }
        if ((peakCenter + i)<length) {
            partials[peakCenter + i] += ((1 / (peakWidth + 1)) * ((peakWidth + 1) - i));
        }
    }
}

function filterPeakNotch(partials,length,maxWidth) {
    var peakCenter = Math.floor(Math.random()*length);
    var peakWidth = 1 + Math.round(Math.random()*maxWidth);
    partials[peakCenter] = 0;
    for (var i=1; i<=peakWidth; i++) {
        if ((peakCenter - i)>0) {
            partials[peakCenter - i] -= ((1/(peakWidth+1))*((peakWidth + 1) - i));
        }
        if ((peakCenter + i)<length) {
            partials[peakCenter + i] -= ((1 / (peakWidth + 1)) * ((peakWidth + 1) - i));
        }
    }
}

function filterOrganise(partials,length,strength) {
    for (var i=0; i<length; i++) {
        //octaves
        if (i===1||i===3) {
            partials[i] += strength;
        }
        if (i===7) {
            partials[i] += strength*0.9;
            partials[i+1] += strength*0.05;
        }
        if (i===15) {
            partials[i] += strength*0.25;
            partials[i+1] += strength*0.01;
        }
        if (i===32) {
            partials[i] += strength*0.1;
        }
        //fifths
        if (i===11) {
            partials[i] += strength*0.5;
        }
        if (i===24) {
            partials[i] += strength*0.05;
        }
    }
}

function filterDisorganise(partials,length,strength,multiplesOf) {
    for (var i=0; i<length; i++) {
        if (i%multiplesOf===0) {
            partials[i] += (Math.random()*strength);
        }
    }
}


function filterPeakInterval(partials,length,interval,offset,strength) {
    for (var i=(interval+offset); i<length; i+=interval) {
        partials[i] += strength;
    }
}

function filterZeroMultiple(partials,length,multiplesOf) {
    for (var i=0; i<length; i++) {
        if (i%multiplesOf===0) {
            partials[i] = 0;
        }
    }
}

function filterZeroInterval(partials,length,interval,offset) {
    for (var i=(interval+offset); i<length; i+=interval) {
        partials[i] = 0;
    }
}

function filterMaxAll(partials,length) {
    for (var i=0; i<length; i++) {
        partials[i] = 1;
    }
}

function filterMinAll(partials,length) {
    for (var i=0; i<length; i++) {
        partials[i] = 0;
    }
}

function filter1Over(partials,length) {
    for (var i=1; i<length; i++) {
        partials[i] += (1/i);
    }
}

function filter1OverSquared(partials,length) {
    for (var i=1; i<length; i+=2) {
        partials[i] += (1/(i*i));
    }
}

function filterHighPass(partials,length,strength,boost) {
    for (var i=1; i<length; i++) {
        partials[i] -= ((1-(i/length))*strength);
        partials[i] += boost;
    }
}

function filterLowPass(partials,length,strength,boost) {
    for (var i=(length-1); i>1; i--) {
        partials[i] -= ((i/length)*strength);
        partials[i] += boost;
    }
}

function filterIndexMatchPeak(partials,length,index,strength) {
    var peak = 0;
    for (var i=0; i<length; i++) {
        if (partials[i] > peak) { // get peak
            peak = partials[i];
        }
    }
    partials[index] = peak*strength;
}

function filterStepDown(partials,length,step) {
    for (var i=1; i<length; i++) {
        if (partials[i+step]) {
            partials[i] = partials[i+step];
        } else {
            partials[i] = 0;
        }
    }
}

function filterStepUp(partials,length,step) {
    for (var i=(length-1); i>0; i--) {
        if (partials[i-step]) {
            partials[i] = partials[i-step];
        } else {
            partials[i] = 0;
        }
    }
}

function filterNormalise(partials,length) {
    var peak = 0;
    for (var i=0; i<length; i++) {
        if (partials[i] < 0 || i == 0) { // flatten base | set dc offset to 0
            partials[i] = 0;
        }
        if (partials[i] > peak) { // get peak
            peak = partials[i];
        }
    }
    if (peak>0) { // normalise
        var threshold = 1;
        var multiplier = (((1/peak))*threshold);
        for (i=0; i<length; i++) {
            partials[i] = partials[i] * multiplier;
        }
    } else {
        partials[1] = 1; // add fundamental if all zeros
    }

}



//-------------------------------------------------------------------------------------------
//  NEGATIVE FILTERS (eliminating need for these with subtract function)
//-------------------------------------------------------------------------------------------


function negativeDisorganise(partials,strength,multiplesOf) {
    var l = partials.length;
    for (var i=1; i<l; i++) {
        if (i%multiplesOf!==0) {
            partials[i] *= (strength + tombola.fudgeFloat(6,0.02));
            partials[i] = utils.valueInRange(partials[i],0,1);
        }
    }
}

function negativePeakInterval(partials,interval,strength) {
    var l = partials.length;
    var c = 1;
    for (var i=1; i<l; i++) {

        if (c!==interval) {
            partials[i] *= strength;

        } else {
            c = -1;
        }
        c ++;
    }
}

function negativeLowPass(partials,strength) {
    var l = partials.length;
    for (var i=1; i<l; i++) {
        partials[i] *= (((l/(l-i)) * strength) + (1-strength));
    }
}

function negativeNoise(partials,strength) {
    var l = partials.length;
    for (var i=1; i<l; i++) {
        partials[i] -= tombola.rangeFloat(0,strength);
        partials[i] = utils.valueInRange(partials[i],0,1);
    }
}


//-------------------------------------------------------------------------------------------
//  PARTIAL COMBINATION
//-------------------------------------------------------------------------------------------

// multiplies A by B //
function multiply(partialsA,partialsB) {
    var l = Math.min(partialsA.length,partialsB.length);
    for (var i=1; i<(l); i++) {
        partialsA[i] *= ( partialsB[i-1]);
    }
    partialsA[0] = 0;
}


// add B to A //
function add(partialsA,partialsB) {
    var l = Math.min(partialsA.length,partialsB.length);
    for (var i=1; i<l; i++) {
        partialsA[i] += partialsB[i-1];
        partialsA[i] = utils.valueInRange(partialsA[i],0,1);
    }
}


// subtracts B from A //
function subtract(partialsA,partialsB) {
    var l = Math.min(partialsA.length,partialsB.length);
    for (var i=1; i<l; i++) {
        partialsA[i] -= (1- partialsB[i-1]);
        partialsA[i] = utils.valueInRange(partialsA[i],0,1);
    }
}


// subtracts B from A into negative values //
function subtractHard(partialsA,partialsB) {
    var l = Math.min(partialsA.length,partialsB.length);
    for (var i=1; i<l; i++) {
        partialsA[i] -= (1- partialsB[i-1]);
        partialsA[i] = utils.valueInRange(partialsA[i],-1,1);
    }
}


module.exports = {

    setPartials: setPartials,
    randomPartials: randomPartials,
    modeRandom: modeRandom,
    add: add,
    subtract: subtract,
    subtractHard: subtractHard,
    multiply: multiply,

    randomiseAll: filterRandomiseAll,
    erode: filterErode,
    grow: filterGrow,
    randomPeaks: filterRandomPeaks,
    peakSwell: filterPeakSwell,
    peakNotch: filterPeakNotch,
    organise: filterOrganise,
    disorganise: filterDisorganise,
    peakInterval: filterPeakInterval,
    zeroMultiple: filterZeroMultiple,
    zeroInterval: filterZeroInterval,
    maxAll: filterMaxAll,
    minAll: filterMinAll,
    oneOver: filter1Over,
    oneOverSquared: filter1OverSquared,
    highPass: filterHighPass,
    lowPass: filterLowPass,
    matchPeak: filterIndexMatchPeak,
    stepDown: filterStepDown,
    stepUp: filterStepUp,
    normalise: filterNormalise,


    // abandon these //
    negativeDisorganise: negativeDisorganise,
    negativeNoise: negativeNoise,
    negativePeakInterval: negativePeakInterval,
    negativeLowPass: negativeLowPass
};