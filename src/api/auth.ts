import {Observable, Observer} from "rxjs";
import {AES} from "crypto-js";
import * as Utf8 from "crypto-js/enc-utf8";
import createRedisClient from "./redis";

let client = createRedisClient();

export type Credentials = {username: string, password: string};
export type AggregatedCredentials = {[k: string]: Credentials};

export function getCredentials(credentials: Credentials): Observable<AggregatedCredentials|null>;
export function getCredentials(credentials: Credentials, source: string): Observable<Credentials|null>;
export function getCredentials(credentials: Credentials, source?: string) {
	return Observable.create((observer: Observer<Credentials|AggregatedCredentials|null>) => {
		client.get(credentials.username, (err, reply) => {
			if (err) {
				console.error(err);
				observer.error(err);
			} else {
				if (reply != null) {
					try {
						let bytes = AES.decrypt(reply, credentials.password);
						let obj = JSON.parse(bytes.toString(Utf8));
						observer.next(source == null ? obj : obj[source]);
					} catch (error) {
						console.error(err);
						observer.next(null);
					}
				} else {
					observer.next(null);	
				}
				observer.complete();
			}
		});
	});
}

export function setCredentials(credentials: Credentials, agg: AggregatedCredentials): Observable<void> {
	let enc: string;
	try {
		enc = AES.encrypt(JSON.stringify(agg), credentials.password).toString();
	} catch (err) {
		return Observable.throw(err);
	}
	return Observable.create((obs: Observer<void>) => {
		client.set(credentials.username, enc, (err, reply) => {
			if (err) {
				console.error(err);
				obs.error(err);
			} else {
				obs.next();
				obs.complete();
			}
		});
	});
}

export function updateCredentials(creds: Credentials, source: string, sourceCred: Credentials): Observable<void> {
	return getCredentials(creds)
		.flatMap(agg => {
			let newAgg = {[source]: sourceCred};
			newAgg = agg == null ? newAgg : {...agg, ...newAgg};
			return setCredentials(creds, newAgg);
		});
}