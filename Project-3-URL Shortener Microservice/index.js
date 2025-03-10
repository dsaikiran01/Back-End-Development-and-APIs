require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('node:dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// data of shorturls
let shortNum = 0; // for short address of url
let shorturls = {
  // 1: 'https://www.google.com/', // test
};

app.get('/api/shorturl/:num', (req, res) => {
  const addr = req.params.num;

  if (isNaN(addr)) {
    res.json({ error: 'invalid url' });
  } else if (Object.hasOwn(shorturls, addr)) {
    let url = shorturls[addr];

    // insert http to make global url, if not
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    // redirect needs global url (starts with http) to redirect
    res.redirect(url);
  } else {
    res.json({ error: 'invalid url' });
  }
})

app.use(bodyParser.urlencoded({ extended: true }));
app.post('/api/shorturl', (req, res) => {
  let url = req.body.url;
  let newUrl = url;

  // remove http, if exists, as only hostname allowed
  if (url.startsWith("http")) {
    newUrl = /(?<=http[s]?:\/\/).*(?=\/)?/.exec(url)[0];
    console.log("new url: ", newUrl);
  }

  // localhost not checked by dns lookup
  if (newUrl.startsWith("localhost")) {
    shortNum += 1;
    shorturls[shortNum] = url;
    return res.json({ original_url: url, short_url: shortNum });
  }

  // dns lookup only needs hostname (without http)
  dns.lookup(newUrl, (err, address) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      shortNum += 1;
      shorturls[shortNum] = url;
      res.json({ original_url: url, short_url: shortNum });
    }
  })
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
