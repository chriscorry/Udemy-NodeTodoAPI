// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log("Unable to connect to database server.");
  }
  console.log("Connected to database server.");

  console.log('Deleting all Dogs...');
  db.collection('Users').deleteMany({ name: 'Dog'}).then((result) => {
    if (result.result.ok === 1) {
      console.log(`Deleted ${result.result.n} documents.`);
    }
    else {
      console.log(`Encountered an error:`);
      console.log(result);
    }
  });

  console.log('Deleting doc 59e948b4ab882a910d09c3a9...');
  db.collection('Users').findOneAndDelete({ _id: new ObjectID("59e948b4ab882a910d09c3a9")}).then((result) => {
    if (result.ok === 1) {
      if (result.lastErrorObject.n === 1) {
        console.log(`Deleted document for user ${result.value.name}.`);
      }
      else {
        console.log(`Document for _id not found.`);
      }
    }
    else {
      console.log(`Encountered an error:`);
      console.log(result);
    }
  });

  // deleteMany
  // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
  //   console.log(result);
  // });

  // deleteOne
  // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
  //   console.log(result);
  // });

  // findOneAndDelete
  // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
  //   console.log(result);
  // });

  // db.close();
});
