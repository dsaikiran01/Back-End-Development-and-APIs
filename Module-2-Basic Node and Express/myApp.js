require("dotenv").config();
require("body-parser");
const bodyParser = require("body-parser");
let express = require('express');
let app = express();

// console.log("Hello World");

app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
})

app.get("/", (req, res) => {
    // res.send("Hello Express");
    res.sendFile(__dirname + "/views/index.html");
});

app.use("/public", express.static(__dirname + "/public"));

app.get("/json", (req, res) => {
    let msg = {"message": "Hello json"};
    if(process.env.MESSAGE_STYLE === "uppercase") {
        msg = {"message": msg.message.toUpperCase()};
    }
    res.json(msg);
});

app.get("/now", (req, res, next) => {
    req.time = new Date().toString();
    next();
}, (req, res) => {
    res.send({time: req.time});
});

app.get("/:word/echo", (req, res) => {
    res.json({echo: req.params.word});
})

// using the route handler
app.route("/name")
.get((req, res) => {
    res.json({"name": `${req.query.first} ${req.query.last}`});
})
.post((req, res) => {
    res.json({"name": `${req.body.first} ${req.body.last}`});
});


module.exports = app;
