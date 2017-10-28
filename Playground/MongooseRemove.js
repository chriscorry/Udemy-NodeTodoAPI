const { mongoose } = require('../Server/DB/Mongoose');
const { Todo }     = require('../Server/Models/Todo');
const { User }     = require('../Server/Models/User');
const { ObjectID } = require('mongodb');

// // Remove all documents in the database
// Todo.remove({}).then((res) => {
//   console.log(res);
// });

// Remove a specific document
// Todo.findOneAndRemove({}).then((todo) => {
//   console.log(todo);
// });

// Delete a specific document by ID
Todo.findByIdAndRemove('59f4f3c597e0af26277b40fe').then((todo) => {
  console.log(todo);
});
