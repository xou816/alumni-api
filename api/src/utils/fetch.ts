import defaultFetch, {Request, RequestInit, Response, Body} from 'node-fetch';
import * as decorate from 'fetch-cookie/node-fetch';
import {CookieJar} from 'tough-cookie';
import {Observable} from 'rxjs';

export type Fetch = (url: string|Request, init?: RequestInit) => Observable<Response>;

export function fetchFactory(): Fetch {
	let jar = new CookieJar(undefined, {looseMode: true});
	let decorated = (decorate as <T>(t: T, j: CookieJar) => T)(defaultFetch, jar);
	return (url, init?) => Observable.fromPromise(init != null ? decorated(url, init) : decorated(url, {}));
}

const fetch = fetchFactory();
export default fetch;

export function asText(res: Response) {
	return Observable.fromPromise(res.text());
}

export function asJson(res: Response) {
	return Observable.fromPromise(res.json());
}