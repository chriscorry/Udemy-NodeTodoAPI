const expect       = require('expect');
const request      = require('supertest');
const { ObjectID } = require('mongodb');

const { app }      = require('../Server');
const { Todo }     = require('../Models/Todo');
const { User }     = require('../Models/User');
const { todos, populateTodos, users, populateUsers }
                   = require('./Seed/Seed');


beforeEach(populateUsers);
beforeEach(populateTodos);


//
// POST /todos
// Add a new TODO
//
describe('POST /todos', () => {

  it('should not create a new todo with invalid body data', (done) => {

    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(5);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((resp) => {
        expect(resp.body.text).toBe(text);
      })
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((err) => done(err));
      });
  });

});


//
// GET /todos
// Retrieve all TODOs
//
describe('GET /todos', () => {

  it('should get all todos', (done) => {

    request(app)
      .get('/todos')
      .expect(200)
      .expect((resp) => {
        expect(resp.body.todos.length).toBe(5);
      })
      .end(done);
  });

});


//
// GET /todos/:id
// Retrieve a single TODO
//
describe('GET /todos/:id', () => {

  it('should return todo doc', (done) => {

    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((resp) => {
        expect(resp.body.todo.text).toBe('Kill a hobo.');
      })
      .end(done);
  });

  it('should return 404 if Todo not found', (done) => {

    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object IDs', (done) => {

    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });

});


//
// DELETE /todos/:id
// Remove a single TODO
//
describe('DELETE /todos/:id', () => {

  it('should remove a todo', (done) => {

    var hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((resp) => {
        expect(resp.body.todo.text).toBe('Kill a hobo.');
      })
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        // Verify that the document was not found
        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if Todo not found', (done) => {

    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object IDs', (done) => {

    request(app)
      .delete(`/todos/123`)
      .expect(404)
      .end(done);
  });

});


//
// PATCH /todos/:id
// Update a single TODO
//
describe('PATCH /todos/:id', () => {

  it('should update a todo', (done) => {

    var hexId = todos[0]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .send({ completed: true })
      .expect(200)
      .expect((resp) => {
        expect(resp.body.todo.completed).toBe(true);
        expect(resp.body.todo.completedAt).toBeA('number');
      })
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        // Verify that the document was not found
        Todo.findById(hexId).then((todo) => {
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toBeA('number');
          done();
        }).catch((err) => done(err));
      });
  });

  it('should clear completedAt when completed = false', (done) => {

    var hexId = todos[1]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .send({ completed: false })
      .expect(200)
      .expect((resp) => {
        expect(resp.body.todo.completed).toBe(false);
        expect(resp.body.todo.completedAt).toNotExist();
      })
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        // Verify that the document was not found
        Todo.findById(hexId).then((todo) => {
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toNotExist();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if Todo not found', (done) => {

    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object IDs', (done) => {

    request(app)
      .delete(`/todos/123`)
      .expect(404)
      .end(done);
  });

});


//
// GET /users/me
// Retrieve info about current logged in user
//
describe('GET /users/me', () => {

  it('should return a user if authenticated', (done) => {

    request(app)
      .get(`/users/me`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((resp) => {
        expect(resp.body._id).toBe(users[0]._id.toHexString());
        expect(resp.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {

    request(app)
      .get(`/users/me`)
      .expect(401)
      .end(done);
  });

  it('should return 401 if bad authentication token', (done) => {

    request(app)
      .get(`/users/me`)
      .set('x-auth', 'notadoctor')
      .expect(401)
      .end(done);
  });

});


//
// POST /users
// Add a new USER
//
describe('POST /users', () => {

  it('should create a user', (done) => {

    var email = 'example@example.com';
    var password = 'notadoctor';

    request(app)
      .post('/users')
      .send( {email, password} )
      .expect(200)
      .expect((resp) => {
        expect(resp.headers['x-auth']).toExist();
        expect(resp.body._id).toExist();
        expect(resp.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        // Verify that the user was placed into the database
        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return validation errors if request invalid', (done) => {

    var email = 'not a password';
    var password = 'notadoctor';

    request(app)
      .post(`/users`)
      .send( {email, password} )
      .expect(400)
      .end(done);
  });

  it('should not create user if email already in use', (done) => {

    var email = users[0].email;
    var password = 'notadoctor';

    request(app)
      .post(`/users`)
      .send( {email, password} )
      .expect(400)
      .end(done);
  });

});
