const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

try {
  mongoose.connect(process.env.DB_URL || 'mongodb://localhost/FCC-Backend-Certification');
  console.log("Successfullly connected to db");
} catch (e) {
  console.log(e.message);
}

const userSchema = mongoose.Schema({
  username: {
    type: String,
    require: [true, "Need a user id"],
    unique: [true, "User ID must be unique"]
  },
  exercises: [{
    description: {
      type: String,
      require: [true, "A description is needed"]
    },
    duration: {
      type: Number,
      require: [true, "Duration is needed"]
    },
    date: {
      type: String,
      default: new Date().toDateString()
    }
  }]
}, { versionKey: false });

const User = mongoose.model("User", userSchema);

// creates "users" collection, if not exists
User.createCollection();
console.log("Collection created!");

// added code for UI update

app.get('/api/all', async (req, res) => {
  const users = await User.find({});
  res.send(users);
})

// from test-4
// get to /api/users to get all users
// return arr of objs => [{username, _id}, ...]
app.get('/api/users', async (req, res) => {
  let records = await User.find({}).select({ username: 1, _id: 1 });
  res.json(records);

})

// tests 10-15
// get for /api/users/:id/logs 
// return =>
// {
//   _id: String,
//   username: String,
//   count (no of exercises): int,
//   log: [
//     {
//       description: String,
//       duration: int,
//       date: String
//     },
//     ...
//   ]
// }

// test 16
// get for /api/users/:_id/logs?from&tp&limit (excercise log)
// return =>
// {
//   username: "fcc_test",
//   count: 1,
//   _id: "5fb5853f734231456ccb3b05",
//   log: [{
//     description: "test",
//     duration: 60,
//     date: "Mon Jan 01 1990",
//   }]
// }
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findOne({ _id });

    if (!user) {
      res.status(404).json({ message: "User not found!" });
    }

    let log = user.exercises.map(exercise => {
      const { _id, ...rest } = exercise.toObject();
      return rest;
    });

    // Applying the queries
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate)) {
        return res.status(400).json({ message: "Invalid FROM date format. Use yyyy-mm-dd format" });
      }
      log = log.filter(exercise => new Date(exercise.date) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate)) {
        return res.status(400).json({ message: "Invalid TO date format. Use yyyy-mm-dd format" });
      }
      log = log.filter(exercise => new Date(exercise.date) <= toDate);
    }

    if (limit) {
      const limitInt = parseInt(limit);
      if (isNaN(limitInt) || limitInt <= 0) {
        return res.status(400).json({ message: "LIMIT must be positive integer" });
      }
      log = log.slice(0, limitInt);
    }

    res.status(200).send({
      _id,
      username: user.username,
      count: log.length,
      log
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ message: "Something wrong with input!" });
  }
});

// middleware for parsing incoming URL-encoded data
app.use(express.urlencoded({ extended: true }));


// post for /api/users (new user)
// return => {
//   username: "fcc_test",
//   _id: "5fb5853f734231456ccb3b05"
// }
app.post('/api/users', async (req, res) => {
  const name = req.body.username;

  try {
    const user = await User.create({ username: name });

    if (!user) {
      res.status(403).json({ message: "User already exists" });
    }

    res.status(201).send({
      username: user.username,
      _id: user._id
    });
  } catch (e) {
    console.log(e.message);
    res.status(403).json({ message: e.message });
  }
})

// post for /api/users/:_id/exercises (add exercise)
// form data description, duration, and optionally date. If no date is supplied, the current date will be used
// return (of present added exercise) => 
// {
//   _id: "5fb5853f734231456ccb3b05"
//   username: "fcc_test",
//   description: "test",
//   duration: 60,
//   date: "Mon Jan 01 1990",
// }

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  let { description, duration, date } = req.body;

  const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();

  if (!isNaN(duration)) {
    duration = Number(duration);
  } else {
    res.status(400).json({ message: "duration must be a number!" });
  }

  try {
    const newExercise = {
      description,
      duration,
      date: exerciseDate
    };

    const user = await User.findOneAndUpdate(
      { _id },
      { $push: { exercises: newExercise } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      date: exerciseDate,
      duration: Number(duration),
      description
    });

  } catch (e) {
    console.log(e.message);
    res.status(400).json({ message: e.message });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
