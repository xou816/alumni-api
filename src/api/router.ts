import {Router, Request} from "express";
import {Observable} from "rxjs";

import CentraleCarrieres from "../lib/centrale-carrieres";
import Alumnis from "../lib/alumnis";
import {AlumniProvider, Field} from "../lib/api";
import {AggregatedAlumniProvider} from "../lib/aggregated";
import {Fetch, fetchFactory} from "../utils/fetch";
import {UsernamePasswordCredentials} from "../lib/credentials";
import {redisKeyring} from "./auth";

const ALL = 'all';
const SOURCES: {[k: string]: (f: Fetch) => AlumniProvider<any>} = {
	alumnis: f => new Alumnis(f),
	cc: f => new CentraleCarrieres(f),
	[ALL]: f => new AggregatedAlumniProvider([new Alumnis(f), new CentraleCarrieres(f)], redisKeyring)
};

const BASIC = /^Basic ([A-Za-z0-9+/=]+)$/;

function parseAuthHeader(req: Request): UsernamePasswordCredentials|null {
	let header = req.header('authorization');
	let exec = BASIC.exec(header || '');
	if (exec == null) {
		return null;
	} else {
		let splitted = Buffer.from(exec[1], 'base64').toString().split(':');
		return {username: splitted[0], password: splitted[1]};
	}
}

function credentialsForSource<C>(source: typeof ALL, master: C): Observable<C>;
function credentialsForSource<C>(source: string, master: C): Observable<any>;
function credentialsForSource(source: string, master: UsernamePasswordCredentials): Observable<UsernamePasswordCredentials|any> {
	if (source === ALL) {
		return Observable.of(master);
	} else {
		return redisKeyring.getCredentials(master, source);
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
		redisKeyring.updateCredentials(creds, source, req.body)
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
	} else {
		res.status(403);
		res.send();
	}
});

function searchFromProvider(provider: AlumniProvider<any>, req: Request) {
	let defaults = {
		count: '10'
	};
	let query = {...defaults, ...req.query};
	return provider.search(query)
		.flatMap(a => query.details != null ? provider.getDetails(a) : Observable.of(a))
		.take(parseInt(query.count, 10))
		.toArray()
		.flatMap(res => provider.logout().map(_ => res))
		.map(arr => JSON.stringify(arr));
}

router.get('/search/:source', (req, res) => {
	let source = req.params.source;
	let provider: AlumniProvider<any> = SOURCES[source](fetchFactory());
	let creds = parseAuthHeader(req);
	if (provider != null && creds != null) {
		credentialsForSource(source, creds)
			.flatMap(creds => creds == null ? 
				Observable.throw('Invalid credentials') :
				provider.login(creds))
			.flatMap(_ => searchFromProvider(provider, req))
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

export default router;