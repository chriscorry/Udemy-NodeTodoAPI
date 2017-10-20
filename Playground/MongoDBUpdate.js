// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log("Unable to connect to database server.");
  }
  console.log("Connected to database server.");

  db.collection('Users').findOneAndUpdate(
    { name: 'Susan Corry' },
    { 
      $set: { name: 'Susan H. Corry'},
      $inc: { age: 1 }
    },
    { returnOriginal: false}).then((res) => {
    console.log(res);
  });

  // findOneAndUpdate
  // db.collection('Todos').findOneAndUpdate({ text: 'Eat lunch' }, { $set: { text: 'Eat dinner'} }, { returnOriginal: false}).then((res) => {
  //   console.log(res);
  // });

  // db.close();
});
