var fs = require('fs');
var utils = require('./lib/utils');
var SunCalc = require('suncalc');
var wavEncoder = require('wav-encoder');
var WavDecoder = require("wav-decoder");
var Tombola = require('tombola');
var tombola = new Tombola();

var GenAudio = require('./_GENAUDIO');
var genAudio = new GenAudio();
var GenTweet = require('./_GENTWEET');
var genTweet = new GenTweet();
var GenChart = require('./_GENCHART');
var genChart = new GenChart();
var DrawChart = require('./_DRAWCHART');
var drawChart = new DrawChart();


var SoundCloud = require('./_SOUNDCLOUD');
var soundCloud = new SoundCloud();
var Twitter = require('./_TWITTER');
var twitter = new Twitter();

// All of the main generation actions get initiated here - audio, charts, tweets and star
// trail photos.

//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------


function Action() {

}
var proto = Action.prototype;


proto.init = function(config,soundCloudReady) {
    if (opMode===modes.running || opMode===modes.audioTweet) {
        soundCloud.init(config.soundcloud,soundCloudReady);
    }
    twitter.init(config.twitter);
};




const readFile = function(filepath) {
    return new Promise(function(resolve, reject) {
            fs.readFile(filepath, function(err, buffer) {
            if (err) {
                return reject(err);
            }
            return resolve(buffer);
        });
    });
};

proto.getSample = function(file,callback) {
    readFile(file).then(function(buffer) {
        return WavDecoder.decode(buffer);
    }).then(function(audioData) {
        console.log('decoded');
        mySample = audioData.channelData;
        callback();
    });
};


//-------------------------------------------------------------------------------------------
//  AUDIO
//-------------------------------------------------------------------------------------------


proto.audio = function() {

    // generate audio data //
    var data = genAudio.generateClicks();

    // encode audio data to wav //
    //var options = { float: false, bitDepth: 24 }; // pass as 2nd param
    wavEncoder.encode(data.audioData).then(function(buffer){
        console.log(buffer);

        // write wav as file //
        fs.writeFile("output.wav", new Buffer(buffer), 'utf-8', function(err) {

            if (err) {
                console.log("failed to save");
            } else {
                console.log("succeeded in saving");

                // upload file to soundcloud //
                if (opMode===modes.running || opMode===modes.audioTweet) {
                    uploadAudio(data, 3);
                }
            }
        });
    });
};


function uploadAudio(data,attempts) {

    var options = {
        title: '#' + data.id.strict + '-' + data.cat.strict,
        description: 'Audio received by ARP Observatory on ' + data.date.strict + ' | time: '+data.time.short + ' | length: '+data.seconds + ' seconds | ' + data.frequency.string + ' | BW: ' + data.bandwidth + ' | ' + data.level + ' | RA: 15h 15m 15.04s | DEC: -70 31 10.7',
        genre: 'astronomy',
        sharing: 'public',
        license: 'cc-by-nc',
        downloadable: 'true',
        tag_list: 'astronomy space science radio',
        oauth_token: soundCloud.clientToken,
        asset_data: 'output.wav'
    };

    console.log('upload attempts: '+attempts);
    soundCloud.upload(options,function(err,track) {
        if (err) {
            console.log(err)
        }
        //console.log(track);


        // after upload wait a bit to see if it processed. Sometimes SC gets stuck in the processing state //
        setTimeout(function() {

            //check upload status //
            console.log('track id: '+track.id);
            soundCloud.status(track.id, function(err,result) {

                if (result) {
                    // we're good, post it to twitter //
                    if (result==='finished') {
                        console.log('done processing');
                        var tweet = {
                            status: 'Audio: signal received by ARP Observatory on ' + data.date.strict + ': '+ track.permalink_url
                        };
                        // tweet //
                        twitter.post(tweet);

                        // we're not good, Delete the track and try again //
                    } else {
                        console.log('still processing or failed');
                        soundCloud.delete(track.id, function(err,result) {
                            // try again?
                            if (err.statusCode===500 && attempts>0) {
                                uploadAudio(data,attempts-1);
                            }
                        });
                    }
                }
                else {
                    // we got a 404 on the track - not sure how to handle this yet
                    // currently track is neither tweeted or deleted
                }

            });

        },1000*14,track,data,attempts);

    });
}



//-------------------------------------------------------------------------------------------
//  CHARTS
//-------------------------------------------------------------------------------------------


// SPECTRUM //
proto.chartSpectrum = function() {

    // gen data //
    var data = genChart.generateTimeSpectrum(35,115);

    // draw chart image //
    drawChart.drawTimeSpectrumChart(data);
    var b64 =  utils.stripUriMeta(drawChart.canvas.toDataURL());

    // tweet data //
    var tr = '';
    if (data.truncated) {
        tr = 'truncated ';
    }
    var tweet = {
        media: {
            media_data: b64
        },
        status: 'Frequency response from ' + tr + 'audio received by ARP on ' + data.date.strict + ':'
    };

    // tweet //
    twitter.post(tweet);
};


// PHASE //
proto.chartPhase = function() {

    // gen data //
    var data = genChart.generateScopeData(7000);

    // draw chart image //
    drawChart.drawVectorScopeChart(data);
    var b64 =  utils.stripUriMeta(drawChart.canvas.toDataURL());

    // tweet data //
    var tr = '';
    if (data.truncated) {
        tr = 'truncated ';
    }
    var tweet = {
        media: {
            media_data: b64
        },
        status: 'Stereo Image from sections of ' + tr + 'audio received by ARP on ' + data.date.strict + ':'
    };

    // tweet //
    twitter.post(tweet);
};


// PERIODIC //
proto.chartPeriodic = function() {

    // gen data //
    var data = genChart.generatePeriodicWaves(9);

    // draw chart image //
    drawChart.drawPeriodicWaveChart(data);
    var b64 =  utils.stripUriMeta(drawChart.canvas.toDataURL());

    // tweet data //
    var tweet = {
        media: {
            media_data: b64
        },
        status: 'Periodic waves seen in a selection of recent audio received by ARP:'
    };

    // tweet //
    twitter.post(tweet);
};


// WAVEFORM //
proto.chartWaveform = function() {

    // gen data //
    var data = genChart.generateWaveSection(3.5);

    // draw chart image //
    drawChart.drawWaveformChart(data);
    var b64 =  utils.stripUriMeta(drawChart.canvas.toDataURL());

    // tweet data //
    var tr = '';
    if (data.truncated) {
        tr = 'truncated ';
    }
    var tweet = {
        media: {
            media_data: b64
        },
        status: 'Waveform of a repeating signal present in ' + tr + 'audio received by ARP on ' + data.date.strict + ':'
    };

    // tweet //
    twitter.post(tweet);
};


//-------------------------------------------------------------------------------------------
//  TWEETS
//-------------------------------------------------------------------------------------------


proto.tweet = function(type) {

    // gen data //
    var data = genTweet.generateTweet(type);

    // tweet //
    if (data && data.length>0) {
        var tw = {
            status: data
        };
        twitter.post(tw);
    }
};

proto.print = function(type) {

    // gen data //
    var data = genTweet.generateTweet(type);
    console.log(data);
};


//-------------------------------------------------------------------------------------------
//  TEST
//-------------------------------------------------------------------------------------------


proto.test = function() {
    this.audio();
    var that = this;
    setTimeout(function() {
        soundCloud.newToken();
    },1000*60*3);
    setTimeout(function() {
        that.audio();
    },1000*60*4);
};



module.exports = Action;