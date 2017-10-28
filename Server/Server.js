var express        = require('express');
var bodyParser     = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose }   = require('./DB/Mongoose');
var { Todo }       = require('./Models/Todo');
var { User }       = require('./Models/User');


var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

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


app.listen(port, () => {
    console.log(`Started on port ${port}...');
});

module.exports = { app };
