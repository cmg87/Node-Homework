var dotenv = require("dotenv").config();
var keys = require('./keys.js');
var Twitter = require('twitter');
var request = require('request');
var Spotify = require('node-spotify-api');
var fs = require('fs');
var d = new Date();
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);
var params = process.argv.slice(3);
var action = process.argv[2];

function logger(action, params, log){

    let newlog = `Time: ${d}\nAction: ${action}\nParameters: ${params}\nOutput Result:\n${log}`

    fs.appendFile("log.txt", newlog, function(err) {


        if (err) {
            return console.log(err);
        }



    });
}

function tweet(params){
    let search = params.join('');
    client.get('statuses/user_timeline', {screen_name: search}, function(error, tweets, response) {
        if (!error) {
            let log = [];
            for(let x=0; x<20; x++){
                // console.log(tweets[x].text+ "\nposted on :"+tweets[x].created_at);
                console.log(`${tweets[x].text}\nPosted On: ${tweets[x].created_at}`);
                log.push(`${tweets[x].text}\nPosted On: ${tweets[x].created_at}\n`);
            }
            logger(action, params, log);
        }
    });
}

function music(params){
    spotify.search({ type: 'track', query: params, limit: 1}, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        let song = data.tracks.items[0];
        let log = (`Song Search...\nArtist(s): ${song.artists[0].name}\nSong Name: ${song.name}\nPreview Link: ${song.preview_url}\nAlbum: ${song.album.name}`);
        console.log(log);
        logger(action, params, log);

    });
}

function omdb(params){
    let movie = params.join('+');
    request('http://www.omdbapi.com/?t='+movie+'&apikey=trilogy', function (error, response, body) {
        let result = JSON.parse(body);
        let log = (`OMBD Search Results...\nTitle: ${result.Title}\nYear: ${result.Year}\nIMDB Rating: ${result.imdbRating}\nRotten Tomatoes: ${result.Ratings[1].Value}\nCountry Of Origin: ${result.Country}\nLanguage: ${result.Language}\nPlot: ${result.Plot}\nActors: ${result.Actors}`);
        console.log(log);
        logger(action, params, log);
    });
}

function doWhat(){
    fs.readFile("random.txt", "utf8", function (error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }

        let paramArr = data.split(',');
        let action = paramArr[0];
        let params = paramArr[1];

        switch (action) {
            case 'my-tweets':
                tweet(params);
                break;
            case 'spotify-this-song':
                music(params);
                break;
            case 'movie-this':
                omdb(params);
                break;
        }
    });
}



switch (action) {
    case 'my-tweets':
        tweet(params);
        break;
    case 'spotify-this-song':
        music(params);
        break;
    case 'movie-this':
        omdb(params);
        break;
    case 'do-what-it-says':
        doWhat();
        break;
}

