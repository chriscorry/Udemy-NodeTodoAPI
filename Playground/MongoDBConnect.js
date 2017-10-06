// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log("Unable to connect to database server.");
  }
  console.log("Connected to database server.");

  // Insert new doc into the Todos collection
  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, res) => {
  //   if (err) {
  //     return console.log('Unable to insert TODO.', err);
  //   }
  //   console.log(JSON.stringify(res.ops, undefined, 2));
  // });

  // Insert new doc into the Users collection
  // Name, age, location
  // db.collection('Users').insertOne({
  //   name: 'Chris Corry',
  //   age: 48,
  //   location: 'Sherman Oaks, CA'
  // }, (err, res) => {
  //   if (err) {
  //     return console.log('Unable to insert User.', err);
  //   }
  //   console.log(res.ops[0]._id.getTimestamp());
  //   console.log(JSON.stringify(res.ops, undefined, 2));
  // });

  db.close();
});
