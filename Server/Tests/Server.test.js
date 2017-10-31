const expect       = require('expect');
const request      = require('supertest');
const { ObjectID } = require('mongodb');

const { app }      = require('../Server');
const { Todo }     = require('../Models/Todo');

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


beforeEach((done) => {
    Todo.remove({}).then(() => {
      return Todo.insertMany(todos);
  }).then(() => done());
});

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
