import {Observable} from "rxjs";
import {Alumni, AlumniProvider, Field, Query, Meta} from "./api";
import {Keyring, UsernamePasswordCredentials} from "./credentials";

type Cursor = {
	[k: string]: any
};

export class AggregatedAlumniProvider implements AlumniProvider<UsernamePasswordCredentials, {}, Cursor> {

	protected providers: AlumniProvider<any>[];
	protected keyring: Keyring<UsernamePasswordCredentials>;

	constructor(providers: AlumniProvider<any>[], keyring: Keyring<UsernamePasswordCredentials>) {
		this.providers = providers;
		this.keyring = keyring;
	}

	protected providerFor(source: string): AlumniProvider<any> {
		let provider = this.providers
			.find(p => p.source() === source);
		if (provider == null) throw new Error('No known provider for this alumni!');
		return provider;
	}

	source() {
		return 'aggregated';
	}

	login(master: UsernamePasswordCredentials) {
		return this.keyring.getCredentials(master)
			.flatMap(creds => Object.keys(creds).reduce((acc: Observable<boolean>, source) => {
				return acc.flatMap(res => this.providerFor(source)
						.login(creds[source])
						.map(ok => ok && res));
			}, Observable.of(true)));
	}

	logout() {
		return this.providers
			.map(p => p.logout())
			.reduce((acc, cur) => acc.flatMap(v1 => cur.map(v2 => v1 && v2)), Observable.of(true));
	}

	search(query: Query, cursor: Cursor|null) {
		return Observable.merge(...this.providers.map(p => {
				let source = p.source();
				let sourceCursor = cursor !== null ? cursor[source] : null;
				return p.search(query, sourceCursor)
					.map(n => ({...n, cursor: {[source]: n.cursor} }));
			}))
			.scan(({cursor}, cur) => ({ ...cur, cursor: {...cursor, ...cur.cursor} }));
	}

	getDetails(meta: Meta) {
		let provider = this.providerFor(meta[Field.SOURCE]);
		return provider.getDetails(meta);
	}

}

