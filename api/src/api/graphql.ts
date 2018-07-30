import {graphql, buildSchema} from 'graphql';
import {Observable} from "rxjs";
import {Request} from 'express';
import {join} from 'path';
import {readFileSync} from 'fs';

import {Field, Meta, AlumniProvider, Query, Alumni, Node, Search} from '../lib/api';
import CentraleCarrieres from "../lib/centrale-carrieres";
import Alumnis from "../lib/alumnis";
import {AggregatedAlumniProvider} from "../lib/aggregated";
import {MockAlumniProvider} from "../lib/mock";
import {Fetch, fetchFactory} from "../utils/fetch";
import {UsernamePasswordCredentials} from "../lib/credentials";
import {redisKeyring} from "./auth";

const ALL = 'all';
const SOURCES: {[k: string]: (f: Fetch) => AlumniProvider<any>} = {
	alumnis: f => new Alumnis(f),
	cc: f => new CentraleCarrieres(f),
	mock: f => new MockAlumniProvider(),
	[ALL]: f => new AggregatedAlumniProvider([new Alumnis(f), new CentraleCarrieres(f)], redisKeyring)
};

export const schema = buildSchema(readFileSync(join(__dirname, '../../../schema.graphql')).toString());

type GetCredentials = (source: string) => Observable<any>;

function credentialsForSource<C>(source: typeof ALL, master: C): Observable<C>;
function credentialsForSource<C>(source: string, master: C): Observable<any>;
function credentialsForSource(source: string, master: UsernamePasswordCredentials): Observable<UsernamePasswordCredentials|any> {
	return (source === ALL ? Observable.of(master) : redisKeyring.getCredentials(master, source))
		.filter(c => !(Object.keys(c).length === 0 && c.constructor === Object));
}

export const context = (request: Request & {user: any}) => {
	let credentials = request.user;
	return {
		request,
		getCredentials: (source: string) => credentialsForSource(source, credentials)
	};
};

type Result = Promise<{
	edges: Array<{node: Alumni, cursor: string}>,
	cursor: string|null
}>;

function toResult(search: Search<Alumni>, count: number): Result {
	return search
		.take(count)
		.map(node => ({
			node: node.node,
			cursor: Buffer.from(JSON.stringify(node.cursor)).toString('base64')
		}))
		.toArray()
		.map(edges => ({
			edges,
			cursor: edges.length ? edges[edges.length - 1].cursor : null
		}))
		.toPromise();
}

function alumniResolver(meta: Meta, {getCredentials}: {getCredentials: GetCredentials}): Promise<Alumni> {
	let source = meta[Field.SOURCE] || ALL;
	let provider = SOURCES[source](fetchFactory());
	return getCredentials(source)
		.flatMap(credentials => provider.login(credentials))
		.flatMap(_ => provider.getDetails(meta))
		.single()
		.toPromise();
}

function searchResolver(query: Query & {first: number, after: string}, {getCredentials}: {getCredentials: GetCredentials}): Result {
	let source = query[Field.SOURCE] || ALL;
	let provider = SOURCES[source](fetchFactory());
	let cursor = query.after == null ? null : 
		JSON.parse(Buffer.from(query.after, 'base64').toString());
	return toResult(getCredentials(source)
		.flatMap(credentials => provider.login(credentials))
		.flatMap(_ => provider.search(query, cursor)), 
		query.first || 10);
}

function sourceResolve(args: any, {request}: {request: Request & {user: any}}) {
	return redisKeyring
		.getCredentials(request.user)
		.map(Object.keys)
		.toPromise();
}

function addSourceResolver(args: {source: string, credentials: UsernamePasswordCredentials}, {request}: {request: Request & {user: any}}) {
	return redisKeyring.updateCredentials(request.user as any, args.source, args.credentials)
		.flatMap(bool => redisKeyring.getCredentials(request.user))
		.map(Object.keys)
		.toPromise();
}

export const resolver = {
	alumni: alumniResolver,
	search: searchResolver,
	source: sourceResolve,
	addSource: addSourceResolver
};