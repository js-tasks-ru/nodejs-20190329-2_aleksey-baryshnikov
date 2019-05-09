const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  try {
    if (!email) {
      done(null, false, 'Не указан email');
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, displayName });
      await user.save();
    }

    done(null, user);
  } catch (err) {
    //console.error(err);
    if (err.name === 'ValidationError') {
      var validationError = { name: err.name, errors: {} };
      for (var property in err.errors) {
        if (err.errors.hasOwnProperty(property)) {
          validationError.errors[property] = { message: err.errors[property].message };
        }
      }
      //console.log(validationError);
      done(validationError);
    } else {
      done(err);
    }
  }
};
