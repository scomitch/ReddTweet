//Obligatory starting echos.
console.log("ReddTweet is starting!");

/* 
   Chosen Configs
   sub = Simply include the subreddit name. e.g. askreddit, woof_irl, spacex
   time = The time in milliseconds to which the bot will post. (Default 1 hour)
*/

const sub = "woof_irl";
const time = 3600000;
const caption = "woof_irl";

//Required node libraries for the bot to function.
const Twit = require('twit');
const snoowrap = require('snoowrap');
const configtwit = require('./config/configtwit.js');
const configreddit = require('./config/configoauth.js');
const img = require('image-downloader');
const fs = require('fs');
const writedata = fs.createWriteStream('./data/posts.txt', {flags: 'a'});
const linereader = require('line-by-line');

//Some defines.
let resume = false;

//Configure Twitter Developer Information for the woofirlbot.
//API keys are stored in config.js
const tweet = new Twit(configtwit);
const reddit = new snoowrap(configreddit);
let uarray = [];

//Initiate the bot.
getTopPosts();


//Set global interval to defined time and call the getTopPosts function.
const timer = setInterval(function(){
	getTopPosts();
	console.log("** Timer Triggered. Getting another post**");
}, time);

//getTopPosts function uses the reddit wrapper to grab all hot posts from your chosen subreddit.
//It will then assign a random number to the rand var and parse that into what random url it grabs.
//It will then save that URL as a picture using the image-downloader library.
function getTopPosts(){
	console.log("Grabbing a random picture");
	uarray = [];
	var posts = reddit.getSubreddit(sub).getHot();

	posts.then(url => {
	    let rand = Math.floor((Math.random() * url.length) + 1);
	    saveImage(url[rand].url);
	    return;
	})
}

//saveImage is a function that checks if the link passed into the function is an image.
//If not, it will run getTopPosts again. If so it will pass the URL further onto checkImage.

function saveImage(url){
	if(url.includes(".png") || url.includes(".jpg") || url.includes(".gifv")){
		checkImage(url);
		return;
	} else {
		console.log("** Chosen image isn't in a recognised format. Trying again **");
		getTopPosts();

	}
}

//Simple checker to see if we have already posted that URL by checking the stored components
//inside of posts.txt.
function checkImage(url){
	//Linereader simply reads each line of a document.
	//In this case we are just looping for duplicates (I.e. the image has already been posted)
	let lr = new linereader('./data/posts.txt');
	let write = true;

	lr.on('line', function(line) {
		if(line == url){
			//Contains it already. Will search for another image.
			console.log("** Already posted this before. Trying again **");
			write = false;
			lr.pause();
			getTopPosts();
		} 
	});

	lr.on('end', function () {
		if(write == true){
			//There are no duplicates, so we'll now process the data and forward it to be posted.
			console.log("** No duplicates found. Writing the URL and forwarding to next function **");
			writeImage(url);
			resume = true;
		} else { 
			console.log("** Already posted this before. Trying again **");
			getTopPosts();
			resume = true;
		}
	});

}

//If there is no duplicates to be found, write the current URL to the posts.txt.
function writeImage(url){
	console.log("** Writing URL: " + url + " to file ** ")
	writedata.write("\n" + url + "\r\n");
	downloadImage(url);
}


//downloadImage takes the URL and saves it as an actual 64bit image onto the computer so it can be uploaded as media.
function downloadImage(url){

	//Simple saving config.
	const options = {
	  url: url,
	  dest: './data/'
	}

	//Using an image-downloader library from node to save the URL image to our local machine.
	img.image(options)
	  .then(({ filename, image }) => {
	    console.log("** File saved to - " + filename + " **");
	    tweetImage(filename);
	  })
	  .catch((err) => {
	    console.error("** Error: " + err);
	  })

}

//Tweet function then takes that filename/path and posts that to twitter.
function tweetImage(filename){
	//Grab the image.
	var image = fs.readFileSync("./" + filename, { encoding: 'base64' });
	// first we must post the media to Twitter
	tweet.post('media/upload', { media_data: image }, function (err, data, response) {
	  // now we can assign alt text to the media, for use by screen readers and
	  // other text-based presentations and interpreters
	  var mediaIdStr = data.media_id_string
	  var meta_params = { media_id: mediaIdStr, alt_text: { text: caption } }
	 
	  tweet.post('media/metadata/create', meta_params, function (err, data, response) {
	    if (!err) {
	      // now we can reference the media and post a tweet (media will attach to the tweet)
	      var params = { status: caption, media_ids: [mediaIdStr] }
	 		
	 	  //If the post is successful, great!
	      tweet.post('statuses/update', params, function (err, data, response) {
	        console.log("** Image has been tweeted out! **");
	      })
	    }
	  })
	})
}
