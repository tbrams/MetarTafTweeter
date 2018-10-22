const fs = require('fs');
const Twit = require('twit');
const config = require('./config');

/**
 * Break message into smaller pieces suited for Tweets.
 *
 * When a message is longer than 280 characters, the function will break
 * the string into a suitable number of strings, each prefixed with the
 * id string and pagination.
 *
 * For example:
 * (EKSP 1 of 2):TAF EKSP 211124Z 2112/2212 ...
 * (EKSP 2 of 2):2121 BR BKN004 TEMPO 2207/2212 3500 -RADZ BR BKN008
 *
 * @param  {string} html original message
 * @param  {string} id   Identifier to be used when breaking a message up
 * @return {Array}       Array of strings, ready to be tweeted.
 */
module.exports.breakup =
  function(html, id) {
    var chunks = [];
    const TWEET_MAX_CHARS = 280;
    
    var l = html.length;

    var n = Math.floor(l / (TWEET_MAX_CHARS-11)) + 1;
    if (n > 99) {
      console.log("This status is too long to process ...");
      process.exit(-1);

    } else {
      var leadin="";
      for (var i = 0; i < n; i++) {
        // TAF comes with it's own leadin, so we do not need anyting there
        if (id.toUpperCase().slice(0,3)=="TAF") {
          leadin = (n > 1 ? '(' + id + ' ' + (i + 1) + ' of ' + n + '): ' : '');
        } else {
          // With a single tweet METAR, we can just cut away the redundant station ID
          leadin = (n > 1 ? '(' + id + ' ' + (i + 1) + ' of ' + n + '): ' : id.slice(0,5)+': ');
        }
        var ll = leadin.length;
        var start = i * (TWEET_MAX_CHARS - ll);
        var end = (i + 1) * (TWEET_MAX_CHARS - ll);
        if (end > l) end = l;
        var ss = leadin + html.slice(start, end);
        chunks.push(ss);
      }
    }
    return chunks;
  }


/**
 * fileit - update current status file with latest message.
 *
 * Will file the last known message. If the message has been
 * changed since last time, the new status Will be filed and
 * the function will return true.
 *
 * @param  {string} msg Actual message
 * @param  {string} msg filename - last message stored here
 * @return {boolean}     True if this is a changed message
 *                       False if there has been no change
 */
module.exports.fileit = function(msg, currentfile) {
  var oldmsg = '';

  try {
    oldmsg = fs.readFileSync(currentfile);

    if (oldmsg != msg) {
      console.log('Updating ' + currentfile);
      fs.writeFileSync(currentfile, msg)
      return true;

    } else {
      console.log('No changes stored in ' + currentfile);
      return false;
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('Initialising ' + currentfile);
      fs.writeFileSync(currentfile, msg)
      return true;
    } else {
      throw err;
    }
  }
}



/**
 * tweetIt - Send a tweet with the given message
 *
 * This function requires the configuration file to be present
 * with access tokens.
 *
 * @param  {string} message Test string for tweet
 * @return {none}
 */
module.exports.tweetIt = function(message) {

  var T = new Twit(config);


  T.post('statuses/update', {
    status: message
  }, function(err, data, response) {
    if (err) {
      console.log(`Something went wrong ${err}`);
    } else {
      console.log('Status tweeted!');
    }
  })
}
