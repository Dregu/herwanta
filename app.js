const koa = require('koa'),
	route = require('koa-route'),
	koaws = require('koa-websocket'),
	render = require('./lib/render.js'),
	parse = require('co-body'),
	adj = require('./adj.json'),
	noun = require('./noun.json'),
	alea = require('alea');

const prng = new alea();
const app = koaws(koa());

var games = {};

app.use(require('koa-static')(__dirname + '/static'));
app.use(route.get('/', index));
app.ws.use(route.all('/:id', function* (id) {
	var myid = id;
	this.websocket.on('message', function (msg) {
		for (var i = 0; i < app.ws.server.clients.length; i++ ) {
			var me = app.ws.server.clients[i];
			if (me.upgradeReq.url.match(myid)) {
				me.send(msg);
				games[myid].score = JSON.parse(msg);
			}
		}
	});
}));
app.use(route.get('/:id', show));

function random_int(min, max) {
	return Math.floor(prng() * (max - min + 1)) + min;
}

function newId() {
	return adj[random_int(0, adj.length - 1)] + '-' + noun[random_int(0, noun.length - 1)];
}

function* index() {
	this.redirect('/' + newId());
}

function* show(id) {
	var game = games[id];
	if (!game) {
		game = {
			id: id,
			score: [10, 10, 10, 10]
		};
		games[game.id] = game;
		this.redirect('/' + game.id);
	}
	this.body = yield render('game', {
		game: game
	});
}

app.listen(4203);
