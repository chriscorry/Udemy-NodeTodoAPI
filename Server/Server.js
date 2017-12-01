const { envName }    = require('./Config/Config');

const _              = require('lodash');
const express        = require('express');
const bodyParser     = require('body-parser');
const { ObjectID }   = require('mongodb');

var { mongoose }     = require('./DB/Mongoose');
var { Todo }         = require('./Models/Todo');
var { User }         = require('./Models/User');
var { authenticate } = require('./Middleware/Authenticate');


var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());


//
// Server coming up
//
console.log(`Starting server in environment "${envName}"...`);


//
// POST /todos
// Add a new TODO
//
app.post('/todos', (req, resp) => {

  // Create the new TODO
  var todo = new Todo({
    text: req.body.text
  });

  // ... and save to the database and respond
  todo.save().then((doc) => {
    resp.send(doc);
  }, (err) => {
    resp.status(400).send(err);
  });
});


//
// GET /todos
// Retrieve all TODOs
//
app.get('/todos', (req, resp) => {

  // Make the db request and respond
  Todo.find().then((todos) => {
    resp.send( { todos });
  }, (err) => {
    resp.status(400).send(err);
  });
});


//
// GET /todos/:id
// Retrieve a single TODO
//
app.get('/todos/:id', (req, resp) => {

  // Is this a valid ID?
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return resp.status(404).send({ reason: 'Invalid ID' });
  }

  // Make the db request and respond
  Todo.findById(id).then((todo) => {
    if (todo) {
      // Todo doc was found
      resp.send({ todo });
    }
    else {
      // Todo doc was NOT found
      resp.status(404).send({ reason: 'ID not found.' });
    }
  }).catch((err) => {
    // Badness, brah
    resp.status(400).send(err);
  });
});


//
// DELETE /todos/:id
// Remove a single TODO
//
app.delete('/todos/:id', (req, resp) => {

  // Is this a valid ID?
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return resp.status(404).send({ reason: 'Invalid ID' });
  }

  // Make the db request and respond
  Todo.findByIdAndRemove(id).then((todo) => {
    if (todo) {
      // Todo doc was found
      resp.send({ todo });
    }
    else {
      // Todo doc was NOT found
      resp.status(404).send({ reason: 'ID not found.' });
    }
  }).catch((err) => {
    // Badness, brah
    resp.status(400).send(err);
  });
});


//
// PATCH /todos/:id
// Update a single TODO
//
app.patch('/todos/:id', (req, resp) => {

  // Is this a valid ID?
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return resp.status(404).send({ reason: 'Invalid ID' });
  }

  // Bring over new fields, but ONLY those that are editable
  var body = _.pick(req.body, ['text', 'completed']);

  // Set our completed time, if appropriate
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed = false;
    body.completedAt = null;
  }

  // Make the db request and respond
  Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then((todo) => {
    if (todo) {
      // Todo doc was found
      resp.send({ todo });
    }
    else {
      // Todo doc was NOT found
      resp.status(404).send({ reason: 'ID not found.' });
    }
  }).catch((err) => {
    // Badness, brah
    resp.status(400).send(err);
  });
});


//
// GET /users/me
// Retrieve info about current logged in user
//
app.get('/users/me', authenticate, (req, resp) => {
  return resp.send(req.user);
});


//
// POST /users
// Add a new USER
//
app.post('/users', (req, resp) => {

  // Create the new USER and then generate an authorization token
  var user = new User(_.pick(req.body, ['email', 'password']));

  // ... save to the database and generate an authorization token...
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {

    // ... and then respond with the auth tokenin the header
    resp.header('x-auth', token).send(user);
  }, (err) => {
    resp.status(400).send(err);
  });
});


app.listen(port, () => {
    console.log(`Started on port ${port}...`);
});

module.exports = { app };
