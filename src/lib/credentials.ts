import {Observable} from "rxjs";

export type UsernamePasswordCredentials = {
	username: string;
	password: string;
}

export type AggregatedCredentials = {[k: string]: any};

export interface Keyring<M> {
	getCredentials(master: M): Observable<AggregatedCredentials>;
	getCredentials<C>(master: M, source: string): Observable<C>;
	getCredentials<C>(master: M, source?: string): Observable<C|AggregatedCredentials>;
	updateCredentials<C>(master: M, source: string, newCred: C): Observable<boolean>;
}