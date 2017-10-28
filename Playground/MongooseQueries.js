const { mongoose } = require('../Server/DB/Mongoose');
const { Todo }     = require('../Server/Models/Todo');
const { User }     = require('../Server/Models/User');
const { ObjectID } = require('mongodb');

// User find by ID
var id = "59ebdb2f1e0ce55032599583";

if (!ObjectID.isValid(id)) {
  console.log('User Id is not valid.');
}
else {
  // User.findById(id).then((user) => {
  //   if (!user) {
  //     return console.log('User not found.');
  //   }
  //   console.log('User by Id: ', user);
  // }).catch((err) => console.log(err));

  User.findById(id).then((user) => {
    if (!user) {
      return console.log('User not found.');
    }
    console.log('User by Id: ', user);
  }, (err) => console.log(err));
}

// var id = "59f3dcbcff81d67d43d12891XXX";
//
// if (!ObjectID.isValid(id)) {
//   console.log('Id is not valid.');
// }

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos: ', todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo: ', todo);
// });

// Todo.findById(id).then((todo) => {
//   if (!todo) {
//     return console.log('Id not found.');
//   }
//   console.log('Todo by Id: ', todo);
// }).catch((err) => console.log(err));
