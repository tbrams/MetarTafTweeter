const request = require('request');
const cheerio = require('cheerio');
const util = require('./util.js');

if (process.argv.length <= 3) {
  console.log("Usage: " + __filename + " [AIRPORT] [ TAF | METAR ]");
  process.exit(-1);
}

var param_station = process.argv[2];
var param_type = process.argv[3];
getAviationData(param_type, param_station);

function getAviationData(param_type, param_station) {

  url = '';
  if (param_type.toUpperCase() == "METAR") {
    url =
      'https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecent=true&stationString=' +
      param_station;

  } else {
    // asuming TAF
    url =
      'https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&hoursBeforeNow=6&timeType=issue&mostRecent=true&stationString=' +
      param_station;
  }


  // Parse the web response and make sure we can handle the xml data
  request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(html, {
        xmlMode: true
      });

      // Focus on the raw_text element only and make sure we have some data
      currentStatus = $('raw_text').html();
      if (currentStatus == null) {
        console.log('No ' + param_type + ' avaiable for ' + param_station);
        process.exit(-1);
      }

      // Use a temporary file to check if this was already tweeted
      currentFile = param_type.toLowerCase() + '.current';
      id = param_type.toUpperCase() + ' ' + param_station;
      console.log('id: ', id);
 
      if (util.fileit(currentStatus, currentFile)) {
        chunks = [];
        chunks = util.breakup(currentStatus, id);
        for (i = 0; i < chunks.length; i++) {
          console.log(chunks[i]);
          util.tweetIt(chunks[i]);
        }
      } 
    } else {
      console.log("Error getting web result " + error);
      console.log(url);
      process.exit(-1);
    }
  });
}