require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = mongoose.Schema({
  name: String,
  age: Number,
  favoriteFoods: [String]
});

let Person = mongoose.model("Person", personSchema);

let document = new Person({
  name: "John",
  age: 21,
  favoriteFoods: ["Fish", "Rice Balls"]
});
document.save();

const createAndSavePerson = (done) => {
  // done(null /*, data*/);
  done(null, document);
};

const createManyPeople = async (arrayOfPeople, done) => {
  try {
    let docs = await Person.create(arrayOfPeople);
    done(null, docs);
  } catch (err) {
    done(err);
  }
};

const findPeopleByName = (personName, done) => {
  Person.find({ name: personName }, (err, docs) => {
    if (err) {
      done(err);
    } else {
      done(null, docs);
    }
  });
};

const findOneByFood = (food, done) => {
  Person.findOne({ favoriteFoods: food }, (err, doc) => {
    if (err) done(err);
    else done(null, doc);
  })
};

const findPersonById = async (personId, done) => {
  try {
    let doc = await Person.findById({ _id: personId });
    done(null, doc);
  } catch (err) {
    done(err);
  }
};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";

  Person.findById({ _id: personId }, (err, doc) => {
    if (err) done(err);
    else {
      doc.favoriteFoods.push(foodToAdd);
      doc.save((err, updatedDoc) => {
        if (err) done(err);
        else done(null, updatedDoc);
      })
    }
  });
};

const findAndUpdate = async (personName, done) => {
  const ageToSet = 20;

  Person.findOneAndUpdate({ name: personName }, { age: ageToSet }, { new: true }, (err, updatedDoc) => {
    if (err) done(err);
    else done(null, updatedDoc);
  });

};

const removeById = (personId, done) => {
  Person.findOneAndDelete({ _id: personId }, (err, docs) => {
    if (err) done(err);
    else done(null, docs);
  });
};

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";

  Person.remove({ name: nameToRemove }, (err, json) => {
    if (err) done(err);
    else done(null, json);
  })

};

const queryChain = (done) => {
  const foodToSearch = "burrito";

  Person.find({ favoriteFoods: foodToSearch })
    .sort({ name: 1 })
    .limit(2)
    .select({ name: 1, favoriteFoods: 1 })
    .exec((err, docs) => {
      if (err) done(err);
      else done(null, docs);
    })

};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
