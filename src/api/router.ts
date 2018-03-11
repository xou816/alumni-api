import {Router, Request} from "express";
import {Observable} from "rxjs";

import CentraleCarrieres from "../lib/centrale-carrieres";
import Alumnis from "../lib/alumnis";
import {AlumniProvider, Field} from "../lib/api";
import {AggregatedAlumniProvider} from "../lib/utils";
import {Credentials, getCredentials, updateCredentials} from "./auth";

const AGG = new AggregatedAlumniProvider([Alumnis, CentraleCarrieres]);
const SOURCES = {
	[Alumnis.name()]: Alumnis,
	[CentraleCarrieres.name()]: CentraleCarrieres
};

const BASIC = /^Basic ([A-Za-z0-9+/=]+)$/;

function parseAuthHeader(req: Request): Credentials|null {
	let header = req.header('authorization');
	let exec = BASIC.exec(header || '');
	if (exec == null) {
		return null;
	} else {
		let splitted = Buffer.from(exec[1], 'base64').toString().split(':');
		return {username: splitted[0], password: splitted[1]};
	}
}

let router = Router();

router.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
  	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  	next();
});

router.post('/auth/:source', (req, res) => {
	let source = req.params.source;
	let creds = parseAuthHeader(req);
	if (creds != null) {
		updateCredentials(creds, source, req.body)
			.subscribe(() => {
				res.status(202);
				res.send({
					message: 'Authentication details saved',
					source: source,
					user: creds!.username
				});
			}, err => {
				res.status(500);
				res.send();
			});
	} else {
		res.status(403);
		res.send();
	}
});

function searchFromLoggedProvider(provider: AlumniProvider, req: Request) {
	let count = req.query.count == null ? 10 : parseInt(req.query.count, 10);
	let details = req.query.details != null;
	let query = req.query;
	if (query['class'] != null) {
		let s = query['class'].split('-');
		query.class_1 = s[0];
		query.class_2 = s[s.length - 1];
	}
	return provider.search(query)
		.flatMap(details ? provider.getDetails : t => Observable.of(t))
		.take(count)
		.toArray()
		.flatMap(res => provider.logout().map(_ => res))
		.map(arr => JSON.stringify(arr));
}

router.get('/search/:source', (req, res) => {
	let source = req.params.source;
	let provider: AlumniProvider = SOURCES[source];
	let creds = parseAuthHeader(req);
	if (provider != null && creds != null) {
		getCredentials(creds, source)
			.flatMap(creds => creds == null ? 
				Observable.throw('Invalid credentials') :
				provider.login(creds.username, creds.password))
			.flatMap(_ => searchFromLoggedProvider(provider, req))
			.subscribe(str => {
				res.send(str);
			}, err => {
				console.error(err);
				res.status(500);
				res.send();
			});
	} else {
		res.status(403);
		res.send();
	}
});

router.get('/searchAll', (req, res) => {
	let creds = parseAuthHeader(req);
	if (creds != null) {
		getCredentials(creds)
			.filter(creds => creds != null)
			.flatMap(creds => AGG.loginMany(creds!))
			.flatMap(_ => searchFromLoggedProvider(AGG, req))
			.subscribe(str => {
				res.send(str);
			}, err => {
				res.status(500);
				res.send();
			});
	} else {
		res.status(403);
		res.send();
	}
});

export default router;