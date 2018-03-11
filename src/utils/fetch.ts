import defaultFetch, {Request, RequestInit, Response, Body} from 'node-fetch';
import * as decorate from 'fetch-cookie/node-fetch';
import {Observable} from 'rxjs';

type Fetch = (url: string|Request, init?: RequestInit) => Observable<Response>;

export function fetchFactory(): Fetch {
	let decorated = (decorate as <T>(t: T) => T)(defaultFetch);
	return (url, init?) => Observable.fromPromise(decorated(url, init));
}

const fetch = fetchFactory();
export default fetch;

export function asText(res: Response) {
	return Observable.fromPromise(res.text());
}

export function asJson(res: Response) {
	return Observable.fromPromise(res.json());
}