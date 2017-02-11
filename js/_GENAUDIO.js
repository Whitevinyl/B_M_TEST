
var utils = require('./lib/utils');
var partials = require('./lib/partials');
var Tombola = require('tombola');
var tombola = new Tombola();

var GenChart = require('./_GENCHART');
var genChart = new GenChart();
var Arranger = require('./_ARRANGER');
var arranger = new Arranger();

var audio = require('./_AUDIOCOMPONENTS');
var common = require('./audioComponents/common/common');
var FilterWrapper = require('./_FILTERWRAPPER');

global.audioClock = null;
var signalFail = false;

// Audio is generated here using javascript components in _AUDIOCOMPONENTS.js. Signals are
// generated and filtered in sequence and panned between stereo channels. Multiple techniques
// are used, subtractive & additive synthesis, wavetables, granular self-sampling, IIR & FIR
// filtering. Arranger (_ARRANGER.js) selects the components to be used, and the Orchestrator
// (_ORCHESTRATOR.js) creates them and wraps them for use here.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------


function GenerateAudio() {

}
var proto = GenerateAudio.prototype;


//-------------------------------------------------------------------------------------------
//  MAIN
//-------------------------------------------------------------------------------------------


proto.generate = function() {

    // SETUP THIS AUDIO //
    var seconds = tombola.range(23,31);
    console.log('seconds: '+seconds);

    var l = sampleRate * seconds;
    var channels = [new Float32Array(l),new Float32Array(l)];
    var peak = 0;

    // CHOOSE & CREATE OUR FILTERS/GENERATORS //
    var filters = arranger.arrangement();


    // LOOP EACH SAMPLE //
    for (var i=0; i<l; i++) {
        var signal = [0,0];

        // PROCESS EACH FILTER & CHECK IT RETURNS A GOOD SIGNAL //
        for (var h=0; h<filters.length; h++) {
            var process = filters[h].process(signal, channels, i);
            signal = signalTest(process,signal);
        }

        // ADD START/FINISH NOISE //
        signal = inOut.process(signal,i,l);

        // WRITE TO AUDIO CHANNELS //
        if (channels[0][i]) {
            channels[0][i] += signal[0];
        } else {
            channels[0][i] = signal[0];
        }
        if (channels[1][i]) {
            channels[1][i] += signal[1];
        } else {
            channels[1][i] = signal[1];
        }

        // MEASURE PEAK //
        var ttl = channels[0][i];
        if (ttl<0) { ttl = -ttl; }
        var ttr = channels[1][i];
        if (ttr<0) { ttr = -ttr; }

        if (ttl > peak) { peak = ttl; }
        if (ttr > peak) { peak = ttr; }
    }


    // SECOND PASS //
    var mult = 0.96875/peak;
    for (i=0; i<l; i++) {

        // GET VALUES //
        signal[0] = channels[0][i];
        signal[1] = channels[1][i];

        // NORMALISE //
        signal[0] *= mult;
        signal[1] *= mult;

        // FADES //
        var f = 1;
        var fade = 2500;
        if (i<fade) { f = i / fade; }
        if (i>((l-1)-fade)) { f = ((l-1)-i) / fade; }

        // WRITE VALUES //
        channels[0][i] = signal[0] * f;
        channels[1][i] = signal[1] * f;
    }

    // DONE - ASSEMBLE TRACK DATA //
    console.log('generated');
    return {
        audioData: {
            sampleRate: sampleRate,
            channelData: channels
        },
        seconds: seconds,
        id: genChart.generateID(),
        cat: genChart.generateCat(),
        date: genChart.generateDate(),
        time: genChart.generateTime(),
        frequency: genChart.generateFrequency(),
        bandwidth: genChart.generateBandWidth(),
        level: genChart.generateLevel()
    };
};



proto.generateClicks = function() {

    // SETUP THIS AUDIO //
    var seconds = 30;
    console.log('seconds: '+seconds);

    var l = sampleRate * seconds;
    var channels = [new Float32Array(l),new Float32Array(l)];
    var peak = 0;

    // CREATE CLOCK //
    audioClock = new audio.Clock();
    audioClock.setup();

    var repeater = new audio.Repeater();
    var reverbII = new audio.StereoReverbII();
    var retro = new audio.StereoRetroDelay(l);
    var sample = new audio.Sample();
    var kick = new audio.KickPlayer();
    var clap = new audio.ClapPlayer();
    var snare = new audio.SnarePlayer();

    var resampler = new audio.Resampler();

    var pitch = new audio.PitchShift();
    var chorusPhase = new audio.Chorus();

    var control = new audio.PerlinMod();

    var delay = new audio.GranularDelay();
    var delay2 = new audio.GranularDelayII();
    var delay3 = new audio.GranularDelayIII();

    var hold = new audio.GrainHold();
    var hold2 = new audio.GrainHoldII();

    var free = new audio.StereoFreeVerb();

    var tri = new audio.Triangle();

    var bit = new audio.StereoBitCrush();


    var noise2 = new audio.PhonoCrackle();

    var pmod = new audio.StereoPhaseModulator();

    var shuffle = new audio.Shuffle();

    var boostComp = new audio.BoostComp();

    var t1 = audioClock.randomBeat();
    var t2 = audioClock.randomBeat();

    // LOOP EACH SAMPLE //
    for (var i=0; i<l; i++) {
        var signal = [0,0];

        // PROCESS CLOCK & CHECK IT RETURNS A GOOD SIGNAL //
        var process = audioClock.process(signal,i);
        signal = signalTest(process,signal,i);



        process = sample.process(signal,1,i);
        signal = signalTest(process,signal,i);

        /*var int = audio.controlRange(-5,5,control.process(1.1));
        process = pitch.process(signal,900,12,1);
        signal = signalTest(process,signal,i);*/





        process = kick.process(signal,1,i);
        signal = signalTest(process,signal,i);

        /*process = clap.process(signal,1,i);
        signal = signalTest(process,signal,i);*/

        process = snare.process(signal,1,i);
        signal = signalTest(process,signal,i);


        /*process = delay2.process(signal,35000,35,8000,10,1.7,0,100,1);
        signal = signalTest(process,signal,i);*/





        /*var gh = {
            delayTime: 100,
            grainSize: 8000,
            hold: 10000,
            pitch: 12,
            reverse: true,
            accordion: 0.5,
            feedback: 90,
            mix: 0.5
        };

        process = hold.process(signal,gh.delayTime,gh.grainSize,gh.hold,gh.pitch,gh.reverse,gh.accordion,gh.feedback,gh.mix);
        signal = signalTest(process,signal,i);*/

        //var triScale = tri.process(0.1);

        var fs = {
            room: 0.25,
            damp: 0.55,
            direction: -0.2,
            mix: 0.2
        };

        process = free.process(signal,fs.room,fs.damp,fs.direction,fs.mix);
        signal = signalTest(process,signal,i);

        var gh2 = {
            hold: 40000,
            grainSize: 5000,
            overlap: 2000,
            jitter: 500,
            pitch: 0.3,
            reverse: false,
            feedback: 100,
            mix: 1
        };

        process = hold2.process(signal,gh2.hold,gh2.grainSize,gh2.overlap,gh2.jitter,gh2.pitch,gh2.reverse,gh2.feedback,gh2.mix);
        signal = signalTest(process,signal);






        /*var dl = {
            delayTime: 9000,
            overlap: 10,
            grainSize: 1500,
            scatter: 300,
            movement: 2,
            pitch: 0,
            reverse: false,
            flip: false,
            feeedback: 100,
            mix: 1
        };



        process = delay3.process(signal,dl.delayTime,dl.overlap,dl.grainSize,dl.scatter,dl.movement,dl.pitch,dl.reverse,dl.flip,dl.feeedback,dl.mix);
        signal = signalTest(process,signal);*/



        /*process = chorusPhase.process(signal,2000,0.5,0.5);
        signal = signalTest(process,signal);*/

        /*process = delay.process(signal,40000,2,8000,5,1);
        signal = signalTest(process,signal);*/


        /*process = delay.process(signal,8000,3,1470,0,1);
        signal = signalTest(process,signal);*/

        // audio.controlRange(0,12,tri.process(0.05))
        /*process = shuffle.process(signal,14000,0,0.5);
         signal = signalTest(process,signal);*/

        /*process = bit.process(signal,audio.controlRange(10,100,tri.process(0.2)),true,0.6);
        signal = signalTest(process,signal);*/


        /*process = pmod.process(signal,tri.process(110),audio.controlRange(0,0.3,control.process(0.2)),0.5);
        signal = signalTest(process,signal);*/


        /*process = audio.reverseDelay(signal,0.5,3000,30,channels,i);
        signal = signalTest(process,signal);



         process = retro.process(signal,0.5,t1,t2,0.3,2500,0.7,channels,i);
        signal = signalTest(process,signal);*/




        process = noise2.process(signal,0.1,0.2,7000);
        signal = signalTest(process,signal,i);


        process = boostComp.process(signal);
        signal = signalTest(process,signal,i);

        // WRITE TO AUDIO CHANNELS //
        if (channels[0][i]) {
            channels[0][i] += signal[0];
        } else {
            channels[0][i] = signal[0];
        }
        if (channels[1][i]) {
            channels[1][i] += signal[1];
        } else {
            channels[1][i] = signal[1];
        }




    }


    // SECOND PASS //
    for (i=0; i<l; i++) {


        // ADD RETRO CHANNEL //
        channels[0][i] += retro.channel[0][i];
        channels[1][i] += retro.channel[1][i];

        // GET VALUES //
        signal = readFromChannel(channels,i);

        // RESAMPLER //
        /*process = resampler.process(signal,[0,1,5],250000,channels,i);
        signal = signalTest(process,signal);*/


        // WRITE VALUES //
        writeToChannel(signal,channels,i);

        // MEASURE PEAK //
        peak = measurePeak(peak,channels,i);
    }
    console.log(peak);

    console.log(snare.maxPeak);



    // MASTERING //
    audio.channelEQ(channels, 60,1.5,  800,8,0,  15000,0.5);
    normalisePass(channels,1);
    fadePass(channels,0,0);
    //audio.PeakCompressor(channels, 0.5, 3);
    //var compIII = new audio.CompressorIII();
    //compIII.process(channels);
    normalisePass(channels,0.96875);



    // DONE - ASSEMBLE TRACK DATA //
    console.log('generated');
    return {
        audioData: {
            sampleRate: sampleRate,
            channelData: channels
        },
        seconds: seconds,
        id: genChart.generateID(),
        cat: genChart.generateCat(),
        date: genChart.generateDate(),
        time: genChart.generateTime(),
        frequency: genChart.generateFrequency(),
        bandwidth: genChart.generateBandWidth(),
        level: genChart.generateLevel()
    };
};




proto.generateHit = function() {

    // SETUP THIS AUDIO //
    var seconds = 0.3;
    seconds = (60/70) - 0.05;
    seconds = 2;

    var l = Math.round(sampleRate * seconds);
    var channels = [new Float32Array(l), new Float32Array(l)];

    // CREATE CLOCK //
    audioClock = new audio.Clock();
    audioClock.setup();

    //var kick = new audio.KickPlayer();
    //var clap = new audio.ClapPlayer();
    //var hat = new audio.HatPlayer();
    //var snare = new audio.SnarePlayer();
    var voice = new audio.HarmonicVoice();
    var voice2 = new audio.HarmonicVoice();

    var fm = new audio.FMNoise();
    var fmp = [tombola.rangeFloat(0,7),tombola.rangeFloat(0,7),tombola.rangeFloat(0,7)];
    var fmv = [tombola.rangeFloat(0,1),tombola.rangeFloat(0,1),tombola.rangeFloat(0,1)];

    var tri = new audio.Triangle();
    var saw = new audio.SawTooth();

    var cutoff1 = tombola.range(10,16);
    var cutoff2 = tombola.range(10,16);
    var timbre = partials.randomPartials(cutoff1);
    var timbre2 = partials.randomPartials(cutoff2);


    var big = new audio.BigDrumPlayer();
    var metal = new audio.MetallicPlayer();

    /*var inharm = new audio.InharmonicSine();
    var rat = 1;
    var parts = [new common.Inharmonic()];
    for (var j=1; j<12; j++) {
        rat += tombola.rangeFloat(0.1,2);
        parts.push(new common.Inharmonic(rat, tombola.rangeFloat(0.5,0.9)));
    }
    console.log(parts);*/

    var pluckScale = [
        146.83, // d
        174.61, // f
        196,    // g // root
        220,    // a
        261.63, // c
        293.66, // d
        349.23, // f
        392     // g // root
    ];

    var f = tombola.item(pluckScale);
    if (tombola.percent(30)) {
        f = f*2;
    } else {
        if (tombola.percent(30)) {
            f = f/2;
        }
    }

    console.log('loop');

    // LOOP EACH SAMPLE //
    for (var i = 0; i < l; i++) {
        var signal = [0, 0];

        // PROCESS CLOCK & CHECK IT RETURNS A GOOD SIGNAL //
        var process = audioClock.process(signal, i);
        signal = signalTest(process, signal,i);



        // HAT //
        /*process = hat.process(signal, 0.3, i);
        signal = signalTest(process, signal,i);

        // KICK //
        process = kick.process(signal, 1, i);
        signal = signalTest(process, signal,i);*/


        // BIG DRUM //
        /*process = big.process(signal, 1, i);
        signal = signalTest(process, signal,i);*/

        // METALLIC //
        process = metal.process(signal, 1, i);
        signal = signalTest(process, signal,i);


        /*// SNARE //
        process = snare.process(signal, 1, i);
        signal = signalTest(process, signal,i);*/




        /*var n = fm.process(261.63,fmp[0],fmp[1],fmp[2],fmv[0],fmv[1],fmv[2]) * 0.1;
        signal = [
            signal[0] + n,
            signal[0] + n
        ];*/

        /*var h = inharm.process(50,parts,0.3);
        signal = [
            signal[0] + h,
            signal[0] + h
        ];*/


        // VOICE //
        //audio.controlRange(30,40,tri.process(0.25))
        //audio.controlRange(0,100,saw.process(1))



        /*// metallic //
        var env = common.ADSREnvelope(i,l,[0,2,0.4,65]);
        var v = voice.process(f*0.99, cutoff1, 1, null, timbre);
        var v2 = voice2.process(f*1.016, cutoff2, 1, null, timbre2);

        var tine = (((v + v2)/2) * env);

        process = [
            signal[0] + (((v*0.6)+(v2*0.4))*env),
            signal[1] + (((v*0.4)+(v2*0.6))*env)
        ];
        signal = signalTest(process, signal,i);*/


        // WRITE TO AUDIO CHANNELS //
        if (channels[0][i]) {
            channels[0][i] += signal[0];
        } else {
            channels[0][i] = signal[0];
        }
        if (channels[1][i]) {
            channels[1][i] += signal[1];
        } else {
            channels[1][i] = signal[1];
        }
    }

    //console.log(snare.maxPeak);
    // MASTERING //
    //audio.channelEQ(channels, 60,3,  1000,1,0,  14000,3);
    //normalisePass(channels,1);
    //fadePass(channels,0,0);
    //normalisePass(channels,0.96875);



    // DONE - ASSEMBLE TRACK DATA //
    console.log('generated');
    return {
        audioData: {
            sampleRate: sampleRate,
            channelData: channels
        },
        seconds: seconds,
        id: genChart.generateID(),
        cat: genChart.generateCat(),
        date: genChart.generateDate(),
        time: genChart.generateTime(),
        frequency: genChart.generateFrequency(),
        bandwidth: genChart.generateBandWidth(),
        level: genChart.generateLevel()
    };
};






function normalisePass(channel,max) {
    console.log("Normalising...");
    var i;
    var l = channel[0].length;

    // FIND PEAK //
    var peak = 0;
    for (i=0; i<l; i++) {
        peak = measurePeak(peak,channel,i);
    }


    // WRITE NORMALISED VALUES //
    var norm = max/peak;
    for (i=0; i<l; i++) {
        var signal = readFromChannel(channel,i);
        writeToChannel(multiplySignal(signal,norm),channel,i);
    }
}



function fadePass(channel,fadeIn,fadeOut) {
    console.log("Adding Fades...");
    var i;
    var l = channel[0].length;

    for (i=0; i<l; i++) {
        // GET VALUES //
        var signal = readFromChannel(channel,i);

        // FADES //
        var f = 1;
        if (i<fadeIn) { f = i / fadeIn; }
        if (i>((l-1)-fadeOut)) { f = ((l-1)-i) / fadeOut; }

        // WRITE VALUES //
        writeToChannel(multiplySignal(signal,f),channel,i);
    }
}



function readFromChannel(channel,index) {
    return [
        channel[0][index],
        channel[1][index]
    ];
}

function writeToChannel(signal,channel,index) {
    channel[0][index] = signal[0];
    channel[1][index] = signal[1];
}

function multiplySignal(signal,m) {
    return [
        signal[0] * m,
        signal[1] * m
    ];
}

function measurePeak(peak,channel,index) {
    var ttl = channel[0][index];
    if (ttl<0) { ttl = -ttl; }
    var ttr = channel[1][index];
    if (ttr<0) { ttr = -ttr; }

    if (ttl > peak) { peak = ttl; }
    if (ttr > peak) { peak = ttr; }

    return peak;
}


// TEST A FILTER'S RETURNED SIGNAL //
function signalTest(signal,fallback,i) {
    if (signal!==undefined && signal[0]!==undefined && signal[1]!==undefined && signal[0]==signal[0] && signal[1]==signal[1]) {
        return signal;
    } else {

        if (!signalFail){
            signalFail = true;
            console.log('signal failed :(');
            console.log('at sample: '+i);
            console.log('signal returned: '+signal);
        }

        return fallback;
    }
}


// BIG MESSY TEST FUNCTION - IGNORE THIS //
proto.buildFilters =  function() {
    var settings;
    var f = [];

    // SIREN //
    /*settings = {
        filter: new audio.FilterSiren(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.5},
            {value: 100000}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));*/


    // PULSE //
    /*settings = {
        filter: new audio.FilterPulse(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.7},
            {value: true}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));*/





    // BITCRUSH //
   /* settings = {
        filter: new audio.FilterStereoDownSample(),
        args: [
            {context: true, value: 'signal'},
            {mod:0, min:10, max: 150},
            {value: 0.5}
        ],
        mods: [
            {
                mod: new audio.Glide2(),
                args: [
                    {value: 0.07},
                    {value: 10000}
                ]
            }
        ]
    };
    f.push(new FilterWrapper(settings));*/




    // SIREN //
    settings = {
         filter: new audio.Siren(),
         args: [
             {context: true, value: 'signal'},
             {value: 0.5},
             {value: 100000}
         ],
         mods: []
     };
     f.push(new FilterWrapper(settings));


    // SUB //
    settings = {
        filter: new audio.FilterSubSwell(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.6},
            {value: 200000}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));


    // WAIL //
    settings = {
        filter: new audio.FilterWail(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.6},
            {value: 200000}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));


    // GROWL //
    settings = {
        filter: new audio.FilterGrowl(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.6},
            {value: 200000}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));


    // PHASE WANDER //
    settings = {
        filterFunc: audio.filterStereoFeedbackX,
        args: [
            {context: true, value: 'signal'},
            {value: 0.4},
            {mod: 1, min: 10, max: 2000},
            //{mod: 1, min: -0.1, max: 0.5, floor: 0, ceil: 1},
            //{mod: 0, min: 500, max: 1000},
            {context: true, value: 'channel'},
            {context: true, value: 'index'}
        ],
        mods: [
            /*{
                mod: new audio.FudgeChance(),
                args: [
                    {value: 3},
                    {value: 0.018},
                    {value: 550}
                ]
            }*/
            {
                mod: new audio.Looper(),
                args: [
                    {value: 1000},
                    {value: 0.05},
                    {value: 50000}
                ]
            },
            {
                mod: new audio.MoveTo(),
                args: [
                    {value: 0.09},
                    {value: 20000}
                ]
            }
        ]
    };
    f.push(new FilterWrapper(settings));


    // CHOPPER //
    settings = {
        filter: new audio.FilterStereoChopper(),
        args: [
            {context: true, value: 'signal'},
            {mod:0, min:200, max: 12000},
            {mod:1, min:0, max: 2, floor: 0, ceil: 1}
        ],
        mods: [
            {
                mod: new audio.WalkSmooth(),
                args: [
                    {value: 3},
                    {value: 100}
                ]
            },
            {
                mod: new audio.Walk(),
                args: [
                    {value: 1},
                    {value: 20000}
                ]
            }
        ]
    };
    f.push(new FilterWrapper(settings));


    // CLIPPING //
    settings = {
        filterFunc: audio.filterStereoClipping2,
        args: [
            {context: true, value: 'signal'},
            {value: 0.9},
            {value: 0.2}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));


    // RESAMPLER //
    settings = {
        filter: new audio.FilterResampler(),
        args: [
            {context: true, value: 'signal'},
            {value: 3},
            {value: 200000},
            {context: true, value: 'channel'},
            {context: true, value: 'index'}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));


    // LOW PASS //
    settings = {
        filter: new audio.FilterStereoLowPass2(),
        args: [
            {context: true, value: 'signal'},
            {mod: 0, min: 400, max: 9000},
            {value: 0.92}
        ],
        mods: [
            {
                mod: new audio.Walk(),
                args: [
                    {value: 0.2},
                    {value: 30000}
                ]
            }
        ]
    };
    f.push(new FilterWrapper(settings));

    // WAIL //
    /*settings = {
        filter: new audio.FilterWail(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.5},
            {value: 10000}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));*/

    // GROWL //
    /*settings = {
        filter: new audio.FilterGrowl(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.3},
            {value: 150000}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));*/

    // WAIL //
    /*settings = {
        filter: new audio.FilterWail(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.3},
            {value: 10000},
            {value: 200}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));

    settings = {
        filter: new audio.FilterWail(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.3},
            {value: 15000},
            {value: 300}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));*/


    // HOWL //
    /*settings = {
        filter: new audio.FilterHowl(),
        args: [
            {context: true, value: 'signal'},
            {mod:0, min:150, max: 900},
            {mod:1, min:0, max: 0.7}
        ],
        mods: [
            {
                mod: new audio.Weave(),
                args: [
                    {value: 0.1},
                    {value: 7000}
                ]
            },
            {
                mod: new audio.Walk(),
                args: [
                    {value: 0.09},
                    {value: 15000}
                ]
            }
        ]
    };
    f.push(new FilterWrapper(settings));


    settings = {
        filter: new audio.FilterHowl(),
        args: [
            {context: true, value: 'signal'},
            {mod:0, min:150, max: 900},
            {mod:1, min:0, max: 0.7}
        ],
        mods: [
            {
                mod: new audio.Weave(),
                args: [
                    {value: 0.1},
                    {value: 7000}
                ]
            },
            {
                mod: new audio.Walk(),
                args: [
                    {value: 0.09},
                    {value: 15000}
                ]
            }/!*,
            {
                mod: new audio.Glide(),
                args: [
                    {value: 5},
                    {value: 25000},
                    {value: 1}
                ]
            },
            {
                mod: new audio.WeaveJump(),
                args: [
                    {value: 0.1},
                    {value: 7000},
                    {value: 80000}
                ]
            }*!/
        ]
    };
    f.push(new FilterWrapper(settings));*/


    // PHASE SINE //
    /*var ps1 = tombola.rangeFloat(20,300);
    //var ps2 = tombola.rangeFloat(0.001,1.1);
    var ps2 = tombola.rangeFloat(0.001,0.3);
    var ps3 = tombola.rangeFloat(20,300);
    console.log('f: ' + ps1 + ' f1: ' + ps2 + ' f2: ' + ps3);

    settings = {
        filter: new audio.PhaseWrapper(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.3},
            //{value: ps1},
            {mod:1, min:16, max:200},
            {value: ps2},
            {value: ps3},
            {mod:0, min: -1, max: 1, floor: 0, ceil: 1}
        ],
        mods: [
            {
                mod: new audio.Walk(),
                args: [
                    {value: 0.09},
                    {value: 20000}
                ]
            },
            {
                mod: new audio.Weave(),
                args: [
                    {value: 0.085},
                    {value: 8000}
                ]
            }
        ]
    };
    f.push(new FilterWrapper(settings));


    // PHASE SINE //
    ps1 = tombola.rangeFloat(20,300);
    //ps2 = tombola.rangeFloat(0.001,1.1);
    ps2 = tombola.rangeFloat(0.001,0.3);
    ps3 = tombola.rangeFloat(20,300);
    console.log('f: ' + ps1 + ' f1: ' + ps2 + ' f2: ' + ps3);

    settings = {
        filter: new audio.PhaseWrapper(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.3},
            //{value: ps1},
            {mod:1, min:16, max:200},
            {value: ps2},
            {value: ps3},
            {mod:0, min: -1, max: 1, floor: 0, ceil: 1}
        ],
        mods: [
            {
                mod: new audio.Walk(),
                args: [
                    {value: 0.09},
                    {value: 20000}
                ]
            },
            {
                mod: new audio.Weave(),
                args: [
                    {value: 0.085},
                    {value: 8000}
                ]
            }
        ]
    };
    f.push(new FilterWrapper(settings));*/


    // ERODE //
    /*settings = {
        filterFunc: audio.filterStereoErode,
        args: [
            {context: true, value: 'signal'},
            {value: 1000},
            {context: true, value: 'index'}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));*/

    // GROWL //
    /*settings = {
        filter: new audio.FilterGrowl(),
        args: [
            {context: true, value: 'signal'},
            {value: 0.3},
            {value: 150000}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));*/


    // BURST //
    /*settings = {
        filter: new audio.FilterBurst(),
        args: [
            {context: true, value: 'signal'},
            {value: 1},
            {value: 50000},
            {value: 300},
            {value: true},
            {value: 100}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));
    // BURST //
    settings = {
        filter: new audio.FilterBurst(),
        args: [
            {context: true, value: 'signal'},
            {value: 1},
            {value: 160000},
            {value: 300},
            {value: true},
            {value: 500}
        ],
        mods: [
            {
                mod: new audio.Jump(),
                args: [
                    {value: 90000}
                ]
            }
        ]
    };
    f.push(new FilterWrapper(settings));*/






    // DISTORTION //
    /*settings = {
        filterFunc: audio.filterStereoFoldBack2,
        args: [
            {context: true, value: 'signal'},
            {value: 0.5},
            {value: 0.5}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));


    // FEEDBACK //
    settings = {
        filterFunc: audio.filterStereoFeedbackX,
        args: [
            {context: true, value: 'signal'},
            {value: 0.5},
            //{mod: 0, min: 40, max: 400},
            {mod: 2, min: 10, max: 4000},
            //{mod: 1, min: 10, max: 1000},
            {context: true, value: 'channel'},
            {context: true, value: 'index'}
        ],
        mods: [
            {
                mod: new audio.Glide(),
                args: [
                    //{mod: 0, min: 0.02, max: 0.15},
                    {value: 1},
                    {value: 80000}
                ]
            },
            {
                mod: new audio.FudgeChance(),
                args: [
                    //{mod: 0, min: 0.02, max: 0.15},
                    {value: 3},
                    {value: 0.005},
                    {value: 600}
                ]
            },
            {
                mod: new audio.MoveTo(),
                args: [
                    //{mod: 0, min: 0.02, max: 0.15},
                    {value: 0.5},
                    {value: 100000}
                ]
            }
        ]
    };
    f.push(new FilterWrapper(settings));*/


    // CLIPPING //
    /*settings = {
        filterFunc: audio.filterStereoClipping2,
        args: [
            {context: true, value: 'signal'},
            {value: 0.9},
            {value: 0.1}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));*/





    // LOW PASS //
    /*settings = {
        filter: new audio.FilterStereoLowPass2(),
        args: [
            {context: true, value: 'signal'},
            //{mod: 1, min: 350, max: 9000},
            {mod: 2, min: 500, max: 8000},
            {value: 0.92}
        ],
        mods: [
            {
                mod: new audio.WalkSmooth(),
                args: [
                    {value: 0.2},
                    {value: 1000}
                ]
            },
            {
                mod: new audio.Walk(),
                args: [
                    //{mod: 0, min: 0.02, max: 0.15},
                    {value: 0.1},
                    {value: 20000}
                ]
            },
            {
                mod: new audio.MoveTo(),
                args: [
                    //{mod: 0, min: 0.02, max: 0.15},
                    {value: 0.5},
                    {value: 100000}
                ]
            }
        ]
    };
    f.push(new FilterWrapper(settings));*/





    // RESAMPLER //
    /*var mode = tombola.weightedItem([1,2,3,4],[5,1,5,2]);
    console.log(mode);
    settings = {
        filter: new audio.FilterResampler(),
        args: [
            {context: true, value: 'signal'},
            {value: 6},
            {value: 200000},
            {context: true, value: 'channel'},
            {context: true, value: 'index'}
        ],
        mods: []
    };
    f.push(new FilterWrapper(settings));*/

    return f;
};



module.exports = GenerateAudio;