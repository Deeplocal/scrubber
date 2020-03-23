const SpotifyWebApi = require('spotify-web-api-node');
const player = require('play-sound')(opts = {});
const fs = require('fs');
const request = require('request');
const ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const path = require('path');
const readline = require('readline');
const inquirer = require('./inquirer');
const cmd = require('node-cmd');

//----------- RPi Setup -----------//

const Gpio = require('onoff').Gpio;
var pushButton = new Gpio(5, 'in', 'falling', {debounceTimeout: 100});

var ipAddr;

const fade = 1;
let numSongs = 0;
var audio;

//----------- Spotify Setup -----------//

var code;
var spotifyApi;
var clientId;

//----------- SPOTIFY CRED AND CONFIG CODE HERE -----------//

async function startSpotifyNode (clientId, clientSecret){
    spotifyApi = new SpotifyWebApi({
        clientId,
        clientSecret,
        redirectUri: ipAddr
    });
}

async function setCreds (){
    const credentials = await inquirer.askSpotifyCreds();
    clientId = credentials.clientId;
    const authCode = await inquirer.askAuthCred(ipAddr);
    const config = {
        credentials, 
        authCode
    };

    const configString = JSON.stringify(config);
    fs.writeFileSync('config.json', configString);
    startSpotifyNode(credentials.clientId, credentials.clientSecret);
    await authorizeCode(authCode.code);
}

//----------- Authorize Function -----------//

async function authorizeCode (authCode){
    code = authCode;
    // Retrieve an access token and a refresh token
    await spotifyApi.authorizationCodeGrant(code).then(
        function (data) {
            // console.log(`The token expires in ${  data.body['expires_in']}`);
            // console.log(`The access token is ${  data.body['access_token']}`);
            // console.log(`The refresh token is ${  data.body['refresh_token']}`);

            const config = {
                access_token: data.body['access_token'],
                refresh_token: data.body['refresh_token'],
            };

            fs.readFile('config.json', function (err, data) {
                var json = JSON.parse(data);
                json.tokens = config;
                fs.writeFile('config.json', JSON.stringify(json), function (err) {
                    if (err) throw err;
                    console.log('Token info saved!');
                    fs.mkdirSync('songs');
                    getSongs()
                });
            });
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
        },
        function (err) {
            console.log('Something went wrong!', err);
        }
    );
}

//----------- Get the Input from the Pi -----------//

function getInput (){

    pushButton.watch(function (err, value) {
        if (err) {
            console.error('Error with the Pi Button', err);
            return;
        }
        if (fs.existsSync('songs')) {
            //file exists
            console.log("Song folder Exists!")
            fs.readdir( 'songs', (error, files) => { 
                let totalFiles = files.length;
                console.log(`There are ${totalFiles} available`)
                play(Math.floor(Math.random() * Math.floor(totalFiles)))
            });
        } else{
            fs.mkdirSync('songs');
            getSongs()
        }
        });
}

//----------- Get top 10 Tracks -----------//

function getSongs (){
    console.log('Downloading Songs!');
    spotifyApi.getMyTopTracks(50).then(
        function (data) {
            download(data.body.items, 0);
        },
        function (err) {
            if(spotifyApi.getRefreshToken()){
                spotifyApi.refreshAccessToken().then(
                    function (data) {
                        console.log('The access token has been refreshed!');
                        // Save the access token so that it's used in future calls
                        spotifyApi.setAccessToken(data.body['access_token']);
                        getSongs();
                    },
                    function (err) {
                        console.log('Could not refresh access token', err);
                    }
                );
            }
        }
    );

}
//----------- Download tracks -----------//

function download (data, index){
    if(data[index].preview_url){
        request.get(data[index].preview_url)
            .on('error', function (err) {
                console.error(err);
            })
            .pipe(fs.createWriteStream(`songs/temp${numSongs}.mp3`))
            .on('finish', function () {
                ffmpeg(`songs/temp${numSongs}.mp3`)
                    .inputOptions('-t 20') // 20s
                    .audioFilters([
                        {
                            filter: 'afade',
                            options: `t=in:ss=${0}:d=${fade}`
                        },
                        {
                            filter: 'afade',
                            options: `t=out:st=${20 - fade}:d=${fade}`
                        }
                    ])
                    .output(`songs/audio${numSongs}.mp3`)
                    .on('end', function () {
                        console.log(`Downloaded Song ${numSongs+1}`)
                        fs.unlinkSync(`songs/temp${numSongs}.mp3`);
                        //If there are more items to download
                        if(index < data.length-1) {
                            numSongs++
                            download(data,index+1);
                        }
                        else{
                            console.log('All Songs Downloaded!')
                            play(Math.floor(Math.random() * Math.floor(numSongs)));
                        }
                    })
                    .run(); 

            });
    }
    else{
        if(index < data.length-1) {
            download(data,index+1);
        }
        else{
            console.log('All Songs Downloaded!')
            play(Math.floor(Math.random() * Math.floor(numSongs)));
        }
    }
}

//----------- Plays Audio -----------//

function play (num){
    console.log(`Playing ${num} now`);
    if(audio){
        audio.kill();
    }

    audio = player.play(`songs/audio${num}.mp3`, { omxplayer: ['-o', 'alsa:hw:1,0'] } , function (err){
        if (err) console.log(err);
    });
}

//----------- Checks if you have a config File and inits -----------//

async function init () {
    if (fs.existsSync('config.json')) {
        //file exists
        fs.readFile('config.json', (err, data) => {
            if (err) throw err;
            const config = JSON.parse(data);
            startSpotifyNode(config.credentials.clientId, config.credentials.clientSecret);
            spotifyApi.setAccessToken(config.tokens.access_token);
            spotifyApi.setRefreshToken(config.tokens.refresh_token);
            getInput();
        });
    }
    else{
        await setCreds();
    }
}

cmd.get(
    "hostname -I",
    function (err, data){
        ipAddr = `http://${data.trim()}:5000`;
    }
);

const app = express();

app.use(express.static('build'));

app.get('/info', (req,res) => {
    var data = {
        clientId,
        ipAddr
    };
    res.json(data);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(`${__dirname}/build/index.html`));
});

app.listen('5000', '0.0.0.0', () => {
    console.log("Scrubber is Scrubbing!")    
    init();
});