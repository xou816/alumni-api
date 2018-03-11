import {Router, Request} from "express";
import CentraleCarrieres from "../lib/centrale-carrieres";
import Alumnis from "../lib/alumnis";
import {AlumniProvider} from "../lib/api";
import {Credentials, getCredentials, updateCredentials} from "./auth";

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
					message: 'Authentication details saved for ' + source
				});
			}, error => {
				res.status(500);
				res.send({error});
			});
	} else {
		res.status(403);
		res.send();
	}
});

router.get('/search/:source', (req, res) => {
	let source = req.params.source;
	let provider: AlumniProvider = SOURCES[source];
	let creds = parseAuthHeader(req);
	if (provider != null && creds != null) {
		getCredentials(creds, source)
			.filter(creds => creds != null)
			.flatMap(creds => provider.login(creds!.username, creds!.password))
			.flatMap(_ => provider.search(req.query))
			.flatMap(provider.getDetails)
			.take(10)
			.toArray()
			.map(arr => JSON.stringify(arr))
			.subscribe(str => res.send(str), 
				err => res.sendStatus(500));
	} else {
		res.sendStatus(403);
	}
});

export default router;