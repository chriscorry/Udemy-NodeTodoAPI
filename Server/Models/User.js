const mongoose  = require('mongoose');
const validator = require('validator');
const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcryptjs');
const _         = require('lodash');


var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
      type: String,
      required: true,
      minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({ _id: user._id.toHexString(), access }, 'ABC123').toString();
  user.tokens.push({ access, token });
  return user.save().then(() => {
    return token;
  });
}

UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'ABC123');
  } catch(err) {
    return Promise.reject(err);
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
}

UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;
  var decoded;

  // Find the user
  return User.findOne({email}).then((user) => {
    if (!user) {
      return new Promise.reject();
    }

    // Make sure the passwords match
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          if (!res) {
            reject(err);
          }
          resolve(user);
        });
    });
  });
}

UserSchema.methods.removeToken = function(token) {
  var user = this;

  return user.update({
    $pull: {
        tokens: { token }
    }
  });
}

UserSchema.pre('save', function(next) {
  var user = this;

  // Has the password changed?
  if (user.isModified('password')) {

    // Password has changed so we need to hash it anew
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
          user.password = hash;
          next();
        });
    });
  }
  else {
    next();
  }
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email']);
}

var User = mongoose.model('User', UserSchema);

module.exports = { User };
