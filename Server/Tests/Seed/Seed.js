const { ObjectID } = require('mongodb');
const jwt          = require('jsonwebtoken');

const { Todo }     = require('../../Models/Todo');
const { User }     = require('../../Models/User');


const todos = [ {
    _id:  new ObjectID(),
    text: 'Kill a hobo.',
  }, {
    _id:  new ObjectID(),
    text: 'Second test todo.',
    completed: true,
    completedAt: 123
  }, {
    text: 'Third test todo.',
  }, {
    text: 'Wait, wut?!?',
  }, {
    text: 'I\'m just here for the cheese.',
  }];

var user1Id = new ObjectID();
var user2Id = new ObjectID();

const users = [ {
    _id:  user1Id,
    email: 'buckskin@naked.com',
    password: 'user1pass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: user1Id.toHexString(), access: 'auth' }, 'ABC123').toString()
    }]
  }, {
    _id:  user2Id,
    email: 'spanish@potato.com',
    password: 'user2pass'
  }];


const populateTodos = (done) => {
    Todo.remove({}).then(() => {
      return Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
      var user1 = new User(users[0]).save();
      var user2 = new User(users[1]).save();

      return Promise.all([ user1, user2 ]);
  }).then(() => done());
};

module.exports = { todos, populateTodos,
                   users, populateUsers };
