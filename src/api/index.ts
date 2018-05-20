import * as express from "express";
import {Request} from "express";
import * as bodyParser from 'body-parser';
import * as graphqlHttp from 'express-graphql';
import router from "./router";
import * as passport from 'passport';
import {BasicStrategy} from 'passport-http';

import {schema, resolver as rootValue, context} from "./graphql";
import {redisKeyring} from './auth';

passport.use(new BasicStrategy((username, password, done) => {
	return done(null, {username, password});
}));

let app = express();
app.use(passport.authenticate('basic', { session: false }));
app.use(bodyParser.json());
app.use('/graphql', graphqlHttp(req => ({
	schema,
	rootValue,
	context: context(req as Request & {user: any}),
	graphiql: true,
	formatError: error => ({
	  message: error.message,
	  locations: error.locations,
	  stack: error.stack ? error.stack.split('\n') : [],
	  path: error.path
	})
})));

app.post('/auth/:source', (req, res) => {
	let source = req.params.source;
	redisKeyring.updateCredentials(req.user as any, source, req.body)
		.subscribe(() => {
			res.status(202);
			res.send({
				message: 'Authentication details saved',
				source: source
			});
		}, err => {
			res.status(500);
			res.send();
		});
});


let port = process.env.PORT != null ? process.env.PORT : 3000;
app.listen(port, () => console.log(port));