# ReddTweet - Node.js Twitter Bot

ReddTweet was a small initiative to originally, post trending dog pictures on Reddit to a twitter bot for "ease of access". Using reddit wrappers and the Twitter API, ReddTweet allows a user to define a subreddit and have the bot iteratively post trending images to a twitter account.

##Installing ReddTweet

Download / clone the repo to your local machine (or a hosted cloud machine such as AWS). Edit the following files with your API credentials which you should apply for using the following links.

Reddit [API](https://www.reddit.com/wiki/api) can be used or alternatively use the snoowrapper [OAuth Helper](https://github.com/not-an-aardvark/reddit-oauth-helper) to generate tokens.
Twitter [Developer](https://developer.twitter.com/en/apps) is also required as they provide you with tokens to post to an account.

Once you have the tokens for both, fill the tokens into the ./config/configoauth.js and configtwit.js respectively. You also have some configuration options inside of ./bot.js which allows you to change subreddit, set your own iterative timer and change caption.

After configuration, simply use node.js (Which is required) to run the bot.js file (or feel free to use any other launcher. I personally use [Forever](https://www.npmjs.com/package/forever))

#License

This bot has no license restrictions. Do what you wish.