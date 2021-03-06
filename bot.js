
// running check //
console.log("hello this is bot.");

var fs = require('fs');
var Colorflex = require('colorflex');

var Scheduler = require('./js/_SCHEDULER');
var scheduler = new Scheduler();
var Action = require('./js/_ACTIONS');
var action = new Action();

global.color = new Colorflex();
global.sampleRate = 44100;

global.mySample = null;

// ARP Observatory by Luke Twyman | t: @whitevinyluk
// @arpobservatory
// soundcloud.com/arpobservatory

// All actions - tweet/audio/chart generation etc are in 'action' (_ACTIONS.js)
// Actions are initiated via the 'scheduler' (_SCHEDULER.js), which every 48 hours plans out
// what actions the bot will make during that 48 hr window.

//-------------------------------------------------------------------------------------------
//  OPERATION MODE
//-------------------------------------------------------------------------------------------

// MODES FOR TESTING //
// (only partially implemented) //
global.modes = {
    'running':          0,
    'audio':            1,
    'audioTweet':       2,
    'phase':            3,
    'phaseTweet':       4,
    'waveform':         5,
    'waveformTweet':    6,
    'periodic':         7,
    'periodicTweet':    8,
    'spectrum':         9,
    'spectrumTweet':    10,
    'tweet':            11,
    'tweetTweet':       12
};

// SET THE CURRENT OPERATION MODE //
global.opMode = modes.audio;
var testTweet = 'tweetWork';


//-------------------------------------------------------------------------------------------
//  SETUP CONFIG
//-------------------------------------------------------------------------------------------

function setupConfig() {
    var config = {};
    var configExists = fs.existsSync('./config.js');
    if (configExists) {
        console.log('file config');
        config = require('./config');
    }
    else {
        console.log('environment config');
        config = {
            twitter: {
                consumer_key:         process.env.TW_KEY,
                consumer_secret:      process.env.TW_SECRET,
                access_token:         process.env.TW_TOKEN,
                access_token_secret:  process.env.TW_TOKEN_SECRET,
                timeout_ms:           60*1000  // optional HTTP request timeout.
            },
            soundcloud: {
                client_id :           process.env.SC_ID,
                client_secret :       process.env.SC_SECRET,
                username :            process.env.SC_USER,
                password :            process.env.SC_PASS
            }
        }
    }
    return config;
}

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------


// START THE BOT RUNNING //
function init() {
    //var config = setupConfig();
    //action.init(config,soundCloudReady);

    // IF WE'RE IN A TESTING MODE //
    switch(opMode) {

        case modes.audio:
            action.audio();
            break;

        case modes.phase:
        case modes.phaseTweet:
            action.chartPhase();
            break;

        case modes.waveform:
        case modes.waveformTweet:
            action.chartWaveform();
            break;

        case modes.periodic:
        case modes.periodicTweet:
            action.chartPeriodic();
            break;

        case modes.spectrum:
        case modes.spectrumTweet:
            action.chartSpectrum();
            break;

        case modes.tweet:
            action.print(testTweet);
            break;

        case modes.tweetTweet:
            action.tweet(testTweet);
            break;

        default:
            break;
    }
}
//init();

var samples = ['./samples/hit_xylophone2.wav', './samples/v9_14.wav', './samples/hit_steel_pan1.wav', './samples/hit_cello_pluck.wav', './samples/hit_chime3.wav', './samples/hit_gong.wav', './samples/hit_kalimba1.wav', './samples/hit_tray2.wav', './samples/hit_xylophone1.wav'];

action.getSample(samples[2],action.audioTest);


//-------------------------------------------------------------------------------------------
//  INITIALISED CALLBACK
//-------------------------------------------------------------------------------------------


// NORMAL RUNNING - START THE SCHEDULER //
// callback once SoundCloud has initialised in action.init //
function soundCloudReady() {
    if (opMode===modes.audioTweet) {
        action.audio();
    } else {
        scheduler.init();
    }
}













