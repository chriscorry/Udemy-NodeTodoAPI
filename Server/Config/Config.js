// Setup our execution environment appropriately
var envName = process.env.NODE_ENV || 'development';
if (envName === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (envName === 'test') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}

module.exports = { envName };
