const passport      = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const async         = require('async');
const jwt           = require('jwt-simple');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt  = require('passport-jwt').ExtractJwt;

const secret = require('../config/config').secret;

const models    = require('../models/index');
const userModel = models.userModel;

passport.use(new BasicStrategy(
  function(username, password, callback) {

    userModel.findOne({ name: username }, function (err, user) {

      if (err) { 
				return callback(err); 
			}

      if (!user) { 
				return callback(null, false); 
			}

      user.arePasswordsMatching(password, function(err, isMatch) {
        
        if (err) { 
          return callback(err); 
        }

        if (!isMatch) { 
          return callback(null, false); 
        }

        const token = jwt.encode(user._id, secret)

        return callback(null, token);
      });
    });
  }
));

let opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = secret;

passport.use(new JwtStrategy(opts, 
  function(jwt_payload, done) {
    const userId = jwt_payload;
    
    userModel.findById(userId, function(err, user) {
        
        if (err) {
            return done(err, false);
        }

        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));

exports.isAuthenticatedWithToken = passport.authenticate('jwt', { session : false });
exports.isAuthenticatedWithBasic = passport.authenticate('basic', { session : false });