const expect   = require('expect');
const request  = require('supertest');

const { app }  = require('../Server');
const { Todo } = require('../Models/Todo');

const todos = [ {
  text: 'First test todo.',
}, {
  text: 'Second test todo.',
}, {
  text: 'Kill a hobo.',
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
