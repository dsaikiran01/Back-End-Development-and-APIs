// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});

// for empty date parameter
app.get("/api/", (req, res) => {
  const currUnix = Number(new Date().getTime());
  const currUtc = new Date().toUTCString();
  res.json({ unix: currUnix, utc: currUtc });
});

// for date parameter
app.get("/api/:date", (req, res) => {

  const input = req.params.date;
  const dateValue = new Date(input);

  if (dateValue == "Invalid Date") {
    const millisecs = Number(input);

    if (isNaN(millisecs)) {
      return res.json({ error: "Invalid Date" });
    }

    const utcString = new Date(millisecs).toUTCString();
    console.log("ms: ", millisecs);
    console.log("utc: ", utcString);

    res.json({ unix: millisecs, utc: utcString });
  } else {

    const unixTimeStamp = Number(dateValue.getTime());
    console.log("unix: ", unixTimeStamp);

    res.json({ unix: unixTimeStamp, utc: dateValue.toUTCString() });
  }

});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
