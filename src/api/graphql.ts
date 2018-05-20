import {graphql, buildSchema} from 'graphql';
import {Observable} from "rxjs";
import {Request} from 'express';

import {Field, Meta, AlumniProvider, Query, Alumni} from '../lib/api';
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
	enum Sex {
		M,
		MME,
		MLLE,
		UNSPEC
	}

	type Alumni {
		${Field.ID}: ID!
		${Field.SOURCE}: String!
		${Field.URL}: String
		${Field.SEX}: Sex
		${Field.FIRST_NAME}: String
		${Field.LAST_NAME}: String
		${Field.CLASS}: Int
		${Field.COMPANY}: [String]
		${Field.SCHOOL}: String
		${Field.EMAIL}: [String]
		${Field.PHONE}: [String] 
	}

	type Query {
		alumni(${Field.SOURCE}: String, ${Field.ID}: ID!): Alumni
		search(
			${Field.SOURCE}: [String!],
			${Field.FIRST_NAME}: String,
			${Field.LAST_NAME}: String,
			${Field.CLASS}: String,
			${Field.COMPANY}: [String]
		): [Alumni]
	}
`);

type GetCredentials = (source: string) => Observable<any>;

function alumniResolver(meta: Meta, {getCredentials}: {getCredentials: GetCredentials}): Promise<Alumni> {
	let source = meta[Field.SOURCE] || ALL;
	let provider = SOURCES[source](fetchFactory());
	return getCredentials(source)
		.flatMap(credentials => provider.login(credentials))
		.flatMap(_ => provider.getDetails(meta))
		.single()
		.toPromise();
}

function searchResolver(query: Query, {getCredentials}: {getCredentials: GetCredentials}): Promise<Alumni[]> {
	let source = query[Field.SOURCE] || ALL;
	let provider = SOURCES[source](fetchFactory());
	return getCredentials(source)
		.flatMap(credentials => provider.login(credentials))
		.flatMap(_ => provider.search(query))
		.take(10)
		.toArray()
		.toPromise();
}

export const resolver = {
	alumni: alumniResolver,
	search: searchResolver
};

function credentialsForSource<C>(source: typeof ALL, master: C): Observable<C>;
function credentialsForSource<C>(source: string, master: C): Observable<any>;
function credentialsForSource(source: string, master: UsernamePasswordCredentials): Observable<UsernamePasswordCredentials|any> {
	if (source === ALL) {
		return Observable.of(master);
	} else {
		return redisKeyring.getCredentials(master, source);
	}
}

export const context = (request: Request & {user: any}) => {
	let credentials = request.user;
	return {
		request,
		getCredentials: (source: string) => credentialsForSource(source, credentials)
			.flatMap(credentials => credentials == null ? 
				Observable.throw('Invalid credentials') :
				Observable.of(credentials))
	};
};