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
