import {Observable, Observer} from "rxjs";
import {AES} from "crypto-js";
import * as Utf8 from "crypto-js/enc-utf8";
import {RedisClient} from "redis";

import createRedisClient from "./redis";
import {Keyring, UsernamePasswordCredentials, AggregatedCredentials} from "../lib/credentials";

const client = createRedisClient();

export class RedisKeyring implements Keyring<UsernamePasswordCredentials> {

	private client: RedisClient;

	constructor(client: RedisClient) {
		this.client = client;
	}

	private decryptReply(reply: string, key: string): any|null {
		try {
			let bytes = AES.decrypt(reply, key);
			let obj = JSON.parse(bytes.toString(Utf8));
			return obj;
		} catch (error) {
			return null;
		}
	}

	private setCredentials(master: UsernamePasswordCredentials, agg: AggregatedCredentials): Observable<boolean> {
		let enc: string;
		try {
			enc = AES.encrypt(JSON.stringify(agg), master.password).toString();
		} catch (err) {
			return Observable.throw(err);
		}
		return Observable.create((obs: Observer<boolean>) => {
			client.set(master.username, enc, (err, reply) => {
				if (err) {
					console.error(err);
					obs.error(err);
				} else {
					obs.next(true);
					obs.complete();
				}
			});
		});
	}

	getCredentials(master: UsernamePasswordCredentials): Observable<AggregatedCredentials>;
	getCredentials<C>(master: UsernamePasswordCredentials, source: string): Observable<C>;
	getCredentials<C>(master: UsernamePasswordCredentials, source?: string): Observable<C|AggregatedCredentials> {
		return Observable.create((observer: Observer<C|AggregatedCredentials|null>) => {
			client.get(master.username, (err, reply) => {
				if (err) {
					console.error(err);
					observer.error(err);
				} else {
					if (reply != null) {
						let decrypted = this.decryptReply(reply, master.password);
						if (decrypted === null) {
							observer.error('wrong password');
						} else {
							observer.next(source == null ? decrypted : decrypted[source]);
						}
					} else {
						observer.next({});
					}
					observer.complete();
				}
			});
		});
	}

	updateCredentials<C>(master: UsernamePasswordCredentials, source: string, newCred: C): Observable<boolean> {
		return this.getCredentials(master)
			.flatMap(agg => {
				let newAgg = {[source]: newCred};
				newAgg = agg == null ? newAgg : {...agg, ...newAgg};
				return this.setCredentials(master, newAgg);
			});
	}
}

export const redisKeyring = new RedisKeyring(client);