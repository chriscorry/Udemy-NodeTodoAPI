var express      = require('express');
var bodyParser   = require('body-parser');

var { mongoose } = require('./DB/Mongoose');
var { Todo }     = require('./Models/Todo');
var { User }     = require('./Models/User');


var app = express();

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


app.listen(3000, () => {
    console.log('Started on port 3000...');
});

module.exports = { app };
