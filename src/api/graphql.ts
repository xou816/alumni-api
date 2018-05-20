import {graphql, buildSchema} from 'graphql';
import {Observable} from "rxjs";
import {Request} from 'express';

import {Field, Meta, AlumniProvider, Query, Alumni, Node, Search} from '../lib/api';
import CentraleCarrieres from "../lib/centrale-carrieres";
import Alumnis from "../lib/alumnis";
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

export const schema = buildSchema(`
	type Alumni {
		${Field.ID}: ID!
		${Field.SOURCE}: String!
		${Field.URL}: String
		${Field.SEX}: String
		${Field.FIRST_NAME}: String
		${Field.LAST_NAME}: String
		${Field.CLASS}: Int
		${Field.COMPANY}: [String]
		${Field.SCHOOL}: String
		${Field.EMAIL}: [String]
		${Field.PHONE}: [String] 
	}

	type Edges {
		node: Alumni
		cursor: String
	}

	type Page {
		edges: [Edges]
		cursor: String
	}

	type Query {
		alumni(${Field.SOURCE}: String, ${Field.ID}: ID!): Alumni
		search(
			count: Int,
			cursor: String,
			${Field.SOURCE}: String,
			${Field.FIRST_NAME}: String,
			${Field.LAST_NAME}: String,
			${Field.CLASS}: String,
			${Field.COMPANY}: String
		): Page
	}
`);

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
	cursor: string
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
			cursor: edges[edges.length - 1].cursor
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

function searchResolver(query: Query & {count: number, cursor: string}, {getCredentials}: {getCredentials: GetCredentials}): Result {
	let source = query[Field.SOURCE] || ALL;
	let provider = SOURCES[source](fetchFactory());
	let cursor = query.cursor == null ? null : 
		JSON.parse(Buffer.from(query.cursor, 'base64').toString());
	return toResult(getCredentials(source)
		.flatMap(credentials => provider.login(credentials))
		.flatMap(_ => provider.search(query, cursor)), 
		query.count || 10);
}

export const resolver = {
	alumni: alumniResolver,
	search: searchResolver
};