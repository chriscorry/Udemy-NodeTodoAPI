// Setup our execution environment appropriately
var envName = process.env.NODE_ENV || 'development';

if (envName === 'development' || envName === 'test') {

  try {
    // Load in our config object
    var config = require('./Config.json');
    var globalConfig = config['global'];
    var envConfig = config[envName];

    // Load in the environment variables
    if (globalConfig) {
      Object.keys(globalConfig).forEach((key) => {
          process.env[key] = globalConfig[key];
      });
    }
    if (envConfig) {
      Object.keys(envConfig).forEach((key) => {
          process.env[key] = envConfig[key];
      });
    }
    else {
      throw({reason: `Could not find configuration for environment '${envName}'`});
    }
  } catch (err) {

    // Guess we're not starting up after all
    console.log('ERR: Could not extract valid configuration.');
    console.log('ERR: Additional information...');
    console.log(JSON.stringify(err, null, 2));
    process.exit(err.status);
  }
}

module.exports = { envName };
