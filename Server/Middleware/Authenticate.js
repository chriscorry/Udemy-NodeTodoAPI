var { User } = require('../Models/User');


var authenticate = (req, resp, next) => {

  // Extract the token...
  var token = req.header('x-auth');

  // ... and find the user record that corresponds
  User.findByToken(token).then((user) => {

      // Did we find it?
      if (!user) {
        // Token was okay, but a user was not found for it
        return Promise.reject();
      }

      // Yep -- pass it back
      req.user = user;
      req.token = token;
      next();
  }).catch((err) => {
    // Badness, brah
    resp.status(401).send(err);
  });
}

module.exports = { authenticate };
