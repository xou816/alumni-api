import defaultFetch, {Request, RequestInit, Response, Body} from 'node-fetch';
import * as decorate from 'fetch-cookie/node-fetch';
import {Observable} from 'rxjs';

const decorated = (decorate as <T>(t: T) => T)(defaultFetch);

export function fetch(url: string|Request, init?: RequestInit): Observable<Response> {
 	return Observable.fromPromise(decorated(url, init));
}

export function asText(res: Response) {
	return Observable.fromPromise(res.text());
}

export function asJson(res: Response) {
	return Observable.fromPromise(res.json());
}