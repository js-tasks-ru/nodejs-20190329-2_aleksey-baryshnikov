const Koa = require('koa');
const Router = require('koa-router');

const mongoose = require('mongoose');

const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.name === 'ValidationError') {

      // populate errors with messages
      var errors = {};
      for (var property in err.errors) {
        if (err.errors.hasOwnProperty(property)) {
          errors[property] = err.errors[property].message;
        }
      }

      ctx.status = 400;
      ctx.body = { errors };

    } else if (err.status) {
      ctx.status = err.status;
      ctx.body = { error: err.message };
    } else {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error', err };
    }
  }
});

var idIsValid = (id) => mongoose.Types.ObjectId.isValid(id);

const User = require('./models/User');

const router = new Router();

router.get('/users', async (ctx) => {
  var users = await User.find();
  ctx.body = users;
});

router.get('/users/:id', async (ctx) => {
  var id = ctx.params.id;
  if (!idIsValid(ctx.params.id)) { ctx.status = 400; return; }

  var user = await User.findById(id);
  if (user == null) { ctx.status = 404; return; }

  ctx.body = user;
});

router.patch('/users/:id', async (ctx) => {
  var id = ctx.params.id;
  if (!idIsValid(ctx.params.id)) { ctx.status = 400; return; }

  var updateUserRequest = ctx.request.body;

  var user = await User.findById(id);
  if (updateUserRequest.email) { user.email = updateUserRequest.email; }
  if (updateUserRequest.displayName) { user.displayName = updateUserRequest.displayName; }
  await user.save();

  // we could also use this one -> await User.findByIdAndUpdate(id, updatedUser, { runValidators: true, new: true })

  ctx.body = user;
});

router.post('/users', async (ctx) => {
  var createUserRequest = ctx.request.body;

  var user = new User({
    email: createUserRequest.email,
    displayName: createUserRequest.displayName
  });

  await user.save();
  ctx.body = user;
});

// we can pass validateId middleware into the method
// router.delete('/users/:id', validateId, async (ctx) => { ....
// validateId would have the following interface: function validateId(ctx, next) { if (!validId(ctx.params.id) {ctx.throw(400)} else return next(); )}

router.delete('/users/:id', async (ctx) => {
  var id = ctx.params.id;
  if (!idIsValid(id)) { ctx.status = 400; return; }

  var user = await User.findByIdAndRemove(id);
  if (user == null) { ctx.status = 404; return; }

  ctx.body = { ok: true };
});

app.use(router.routes());

module.exports = app;
