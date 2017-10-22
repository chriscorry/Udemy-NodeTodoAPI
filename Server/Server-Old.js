var { mongoose } = require('./DB/Mongoose');
var { Todo }     = require('./Models/Todo');
var { User }     = require('./Models/User');


// Create new user
var newUser = new User({
  email: 'bob@animal.com'
});

newUser.save().then((doc) => {
  console.log('Saved User:', doc);
}, (err) => {
  console.log('Unable to save User', err);
});

// var newTodo = new Todo({
//   text: 'Eat a turkey',
//   completed: false,
//   completedAt: 7364675
// });
//
// newTodo.save().then((doc) => {
//   console.log('Saved Todo:', doc);
// }, (err) => {
//   console.log('Unable to save Todo');
// });
