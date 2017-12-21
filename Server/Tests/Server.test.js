const expect       = require('expect');
const request      = require('supertest');
const { ObjectID } = require('mongodb');

const { app }      = require('../Server');
const { Todo }     = require('../Models/Todo');
const { User }     = require('../Models/User');
const { todos, populateTodos, users, populateUsers }
                   = require('./Seed/Seed');


/****************************************************************************
 **                                                                        **
 ** SETUP                                                                  **
 **                                                                        **
 ****************************************************************************/

// Setup database before each test
beforeEach(populateUsers);
beforeEach(populateTodos);


/****************************************************************************
 **                                                                        **
 ** USERS API                                                              **
 **                                                                        **
 ****************************************************************************/

//
// POST /users/login
// Login an existing user
//
describe('POST /users/login', () => {

  it('should login an existing user', (done) => {

    var email = users[0].email;
    var password = users[0].password;
    var id = users[0]._id;

    request(app)
      .post('/users/login')
      .send( {email, password} )
      .expect(200)
      .expect((resp) => {
        expect(resp.headers['x-auth']).toBeTruthy();
        expect(resp.body._id).toBeTruthy();
        expect(resp.body.email).toBe(email);
      })
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        // Verify that the in the database has the same token
        User.findById(id).then((user) => {
          expect(user).toBeTruthy();
          expect(user.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: resp.headers['x-auth']
          });
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return error if user does not exist', (done) => {

    var email = 'not an email';
    var password = users[0].password;

    request(app)
      .post(`/users/login`)
      .send( {email, password} )
      .expect(400)
      .end(done);
  });

  it('should return error if incorrect password is specified', (done) => {

    var email = users[0].email;
    var password = 'notadoctor';

    request(app)
      .post(`/users/login`)
      .send( {email, password} )
      .expect(400)
      .end(done);
  });

});


//
// DELETE /users/me/token
// Logout current user
//
describe('DELETE /users/me/token', () => {

  it('should remove auth token on logout', (done) => {

    var id = users[0]._id;

    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        // Verify that the in the database has the same token
        User.findById(id).then((user) => {
          expect(user).toBeTruthy();
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return error if user not logged in', (done) => {

    request(app)
      .delete(`/users/me/token`)
      .send()
      .expect(401)
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
        expect(resp.headers['x-auth']).toBeTruthy();
        expect(resp.body._id).toBeTruthy();
        expect(resp.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        // Verify that the user was placed into the database
        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return validation errors if request invalid', (done) => {

    var email = 'not an email';
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


/****************************************************************************
 **                                                                        **
 ** TODOS API                                                              **
 **                                                                        **
 ****************************************************************************/

//
// POST /todos
// Add a new TODO
//
describe('POST /todos', () => {

  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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

  it('should not create a new todo with invalid body data', (done) => {

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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

});


//
// GET /todos
// Retrieve all TODOs
//
describe('GET /todos', () => {

  it('should get all todos', (done) => {

    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((resp) => {
        expect(resp.body.todos.length).toBe(4);
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((resp) => {
        expect(resp.body.todo.text).toBe('Kill a hobo.');
      })
      .end(done);
  });

  it('should return 404 if Todo belongs to different user', (done) => {

    var hexId = todos[4]._id.toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeTruthy();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if Todo not found', (done) => {

    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object IDs', (done) => {

    request(app)
      .get(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
          expect(todo).toBeFalsy();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if Todo not found', (done) => {

    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object IDs', (done) => {

    request(app)
      .delete(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .send({ completed: true })
      .expect(200)
      .expect((resp) => {
        expect(resp.body.todo.completed).toBe(true);
        expect(typeof resp.body.todo.completedAt).toBe('number');
      })
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        // Verify that the document was not found
        Todo.findById(hexId).then((todo) => {
          expect(todo.completed).toBe(true);
          expect(typeof todo.completedAt).toBe('number');
          done();
        }).catch((err) => done(err));
      });
  });

  it('should clear completedAt when completed = false', (done) => {

    var hexId = todos[1]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({ completed: false })
      .expect(200)
      .expect((resp) => {
        expect(resp.body.todo.completed).toBe(false);
        expect(resp.body.todo.completedAt).toBeFalsy();
      })
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        // Verify that the document was not found
        Todo.findById(hexId).then((todo) => {
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBeFalsy();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if Todo has different owner', (done) => {

    var hexId = todos[4]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if Todo not found', (done) => {

    request(app)
      .patch(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object IDs', (done) => {

    request(app)
      .patch(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

});
