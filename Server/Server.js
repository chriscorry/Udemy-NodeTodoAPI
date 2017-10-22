var express      = require('express');
var bodyParser   = require('body-parser');

var { mongoose } = require('./DB/Mongoose');
var { Todo }     = require('./Models/Todo');
var { User }     = require('./Models/User');


var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, resp) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().th en((doc) => {
    resp.send(doc);
  }, (err) => {
    resp.status(400).send(err);
  });
});

app.listen(3000, () => {
    console.log('Started on port 3000...');
});
