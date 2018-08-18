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
import {makeId, parseId} from "../utils/utils";
import {UsernamePasswordCredentials} from "../lib/credentials";
import {redisKeyring} from "./auth";

const T_ALUMNI = 'Alumni';
const T_SOURCE = 'Source';

const ALL = 'all';
const SOURCES: {[k: string]: (f: Fetch) => AlumniProvider<any, any>} = {
	[ALL]: f => new AggregatedAlumniProvider([new Alumnis(f), new CentraleCarrieres(f), new MockAlumniProvider()], redisKeyring),
	alumnis: f => new Alumnis(f),
	cc: f => new CentraleCarrieres(f),
	mock: f => new MockAlumniProvider()
};

export const schema = buildSchema(readFileSync(join(__dirname, '../../../schema.graphql')).toString());

type MyRequest = Request & {user: any};
type GetCredentials = (source: string) => Observable<any>;

function credentialsForSource<C>(source: typeof ALL, master: C): Observable<C>;
function credentialsForSource<C>(source: string, master: C): Observable<any>;
function credentialsForSource(source: string, master: UsernamePasswordCredentials): Observable<UsernamePasswordCredentials|any> {
	return (source === ALL ? Observable.of(master) : redisKeyring.getCredentials(master, source))
		.filter(c => !(Object.keys(c).length === 0 && c.constructor === Object));
}

export const context = (request: MyRequest) => {
	let credentials = request.user;
	return {
		request,
		getCredentials: (source: string) => credentialsForSource(source, credentials)
	};
};

type Result = Promise<{
	edges: Array<{node: Alumni<string>, cursor: string}>,
	pageInfo: {hasNextPage: boolean, endCursor: string|null}
}>;

function toResult(count: number, search: Search<Alumni<any>>): Result {
	return search
		.take(count)
		.map(({node, cursor}) => ({
			node: {...node, [Field.ID]: makeId({...node[Field.ID], _t: T_ALUMNI})},
			cursor: makeId(cursor)
		}))
		.toArray()
		.map(edges => ({
			edges,
			pageInfo: edges.length === count ? 
				{hasNextPage: true, endCursor: edges[edges.length - 1].cursor} : 
				{hasNextPage: false, endCursor: null}
		}))
		.toPromise();
}

function alumniResolver(id: string, parsed: any, getCredentials: GetCredentials): Promise<Alumni<any>> {
	let provider = SOURCES[ALL](fetchFactory());
	return getCredentials(ALL)
		.single()
		.flatMap(credentials => provider.login(credentials))
		.flatMap(_ => provider.get(parsed))
		.map(alumni => ({...alumni, [Field.ID]: id, __typename: T_ALUMNI}))
		.toPromise();
}

function sourceResolver(id: string, parsed: any, getCredentials: GetCredentials): Promise<any> {
	let source = {
		id,
		key: parsed.key,
		enabled: parsed.key === ALL,
		__typename: T_SOURCE
	};
	return getCredentials(ALL)
		.flatMap(c => Observable.from(Object.keys(c)))
		.filter(key => key === parsed.key)
		.map(key => ({...source, enabled: true}))
		.defaultIfEmpty(source)
		.toPromise();
}

function nodeResolver({id}: {id: string}, {getCredentials}: {getCredentials: GetCredentials}): Promise<any> {
	let {_t, ...parsed} = parseId(id);
	return _t === T_ALUMNI ? alumniResolver(id, parsed, getCredentials) :
		_t === T_SOURCE ? sourceResolver(id, parsed, getCredentials) :
		Promise.reject('node not found');
}

function searchResolver(query: Query & {first: number, after: string}, {getCredentials}: {getCredentials: GetCredentials}): Result {
	let source = query[Field.SOURCE] || ALL;
	let provider = SOURCES[source](fetchFactory());
	let cursor = query.after == null ? null : parseId(query.after);
	return toResult(query.first || 10, 
		getCredentials(source)
			.flatMap(credentials => provider.login(credentials))
			.flatMap(_ => provider.search(query, cursor)));
}

function allSourcesResolver(args: any, {request}: {request: MyRequest}) {
	return redisKeyring.getCredentials(request.user)
		.map(Object.keys)
		.map(keys => Object.keys(SOURCES).reduce((acc: Array<{id: string, key: string, enabled: boolean}>, key) => {
			return acc.concat({
				id: makeId({_t: T_SOURCE, key}),
				key,
				enabled: key === ALL || keys.indexOf(key) > -1
			})
		}, []))
		.toPromise();
}

function addSourceResolver(args: {source: string, credentials: UsernamePasswordCredentials}, {request}: {request: MyRequest}) {
	return redisKeyring.updateCredentials(request.user as any, args.source, args.credentials)
		.toPromise()
		.then(_ => allSourcesResolver(args, {request}));
}

export const resolver = {
	node: nodeResolver,
	search: searchResolver,
	source:allSourcesResolver,
	addSource: addSourceResolver
};