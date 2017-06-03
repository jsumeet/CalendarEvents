var express = require('express');
var moment = require('moment');

var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
var app = express();

app.set('view engine', 'ejs');

app.listen(3007, function () {
    console.log('http://localhost:3007/');
});


var express = require('express');
var router = express.Router();

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs.json';
var ev;
var oauth2Client

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function listEvents(auth, startDate, endDate, res) {
  var calendar = google.calendar('v3');

  var start = new Date().toISOString();
  var end = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
  // if(startDate != null)
  //   start = moment(startDate).toISOString();
  // if(endDate != null)
  //   end = moment(endDate).toISOString();


  //setting start and end based on the query given. 

  if(startDate != null && endDate != null){
    start = moment(startDate).toISOString();
    end = moment(endDate).toISOString();
  }else if (startDate != null && endDate == null){
    start = moment(startDate).toISOString();
    var temp = new Date(startDate);
    end = new Date(temp.setFullYear(temp.getFullYear() + 1)).toISOString();
  }else if (startDate == null && endDate != null){
    end = moment(endDate).toISOString();
    var temp = new Date(endDate);
    start = new Date(temp.setFullYear(temp.getFullYear() - 1)).toISOString();
  }else{
    start =start;
    end = end;
  }


  var reqStart = new Date(start);
  var reqEnd = new Date(end);

  //checking cache
  for(var i=0; i<localStorage.length; i++){
    var keyName = localStorage.key(i);
    var Namearr = keyName.split("+")
    var cacheStartISO = Namearr[0];
    var cacheEndISO = Namearr[1];
    var cacheStartDate = new Date(cacheStartISO);
    var cacheEndDate = new Date(cacheEndISO);

    if(cacheStartDate <= reqStart && cacheEndDate >= reqEnd){
      console.log("Found in the cache!")
      var temp = localStorage.getItem(keyName);

      ev = JSON.parse(temp);
      var ResEvent = [];
      for (var i = 0; i < ev.length; i++) {
        var event = ev[i];
        var ev_start = event.start.dateTime || event.start.date;
        if(new Date(ev_start) >= reqStart && new Date(ev_start) <= reqEnd){
          ResEvent.push(event)
        }

      }
      res.render('calendar', {ResEvent});
      return;
    }
  }  

  console.log("Not found in the cache. Hitting the API.")
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: start,
    timeMax: end,
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }

    var events = response.items;
    var ResEvent = events;
    if (events.length == 0) {
      console.log('No upcoming events found.');
    } else {
      // for (var i = 0; i < events.length; i++) {
      //   var event = events[i];
      //   var ev_start = event.start.dateTime || event.start.date;
      //   console.log('%s - %s', ev_start, event.summary);
      // }
    }
    var lsId = start + '+' + end
    localStorage.setItem(lsId, JSON.stringify(events))
    res.render('calendar', {ResEvent});
  });
  
  //localStorage.clear();
  
  

}

app.get('/', function (req, res) {
  res.send("Please visit http://localhost:3007/calendar-events");
});


app.get('/calendar-events', function (req, res) {
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    

    // Authorize a client with the loaded credentials, then call the
    // Google Calendar API.
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }

    // Create an OAuth2 client with the given credentials, and then execute the
    // given callback function.
    var credentials = JSON.parse(content);
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);


    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {                                        //User is not signed in. Getting url for the new token
        var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
        });
       if(req.query.code ==null){
            res.redirect(authUrl) ;
       }else{                                           // Authorizing the token
            oauth2Client.getToken(req.query.code, function(err, token) {
            if (err) {
              console.log('Error while trying to retrieve access token', err);
              return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            listEvents(oauth2Client, startDate, endDate, res);

            }); 
        }
      } else {                                             // User is already signed in
        oauth2Client.credentials = JSON.parse(token);
        listEvents(oauth2Client, startDate, endDate, res);

      }
    });
    return;
  });

});


module.exports = router;