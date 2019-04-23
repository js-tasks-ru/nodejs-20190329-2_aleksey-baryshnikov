const Koa = require('koa');
const app = new Koa();

const serve = require('koa-static');
app.use(serve('public'));

app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const Chat = require('./chat');
const chat = new Chat();

router.get('/subscribe', async (ctx, next) => {
    var message = await chat.subscribe();
    ctx.body = message;
    return next();
});

router.post('/publish', async (ctx, next) => {
    var message = ctx.request.body.message;
    chat.publish(message);
    ctx.body = message;
    return next();
});

app.use(router.routes());

module.exports = app;
