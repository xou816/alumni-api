import {Observable} from "rxjs";
import {AlumniProvider, Alumni, Field, Query} from "./api";

export class AggregatedAlumniProvider implements AlumniProvider {

	protected providers: AlumniProvider[];

	constructor(providers: AlumniProvider[]) {
		this.providers = providers;
	}

	protected providerFor(source: string): AlumniProvider {
		let provider = this.providers
			.filter(p => p.name() === source).shift();
		if (provider == null) throw new Error('No known provider for this alumni!');
		return provider;
	}

	name() {
		return 'aggregated';
	}

	login(username: string, password: string) {
		return Observable.of(false);
	}

	logout() {
		return this.providers
			.map(p => p.logout())
			.reduce((acc, cur) => acc.flatMap(v1 => cur.map(v2 => v1 && v2)), Observable.of(true));
	}

	loginMany(creds: {[source: string]: {username: string, password: string}}): Observable<boolean> {
		return Object.keys(creds).reduce((acc: Observable<boolean>, source) => {
			return acc.flatMap(res => this.providerFor(source)
					.login(creds[source].username, creds[source].password)
					.map(ok => ok && res));
		}, Observable.of(true));
	}

	search(query: Query) {
		return this.providers
			.map(provider => provider.search(query))
			.reduce((acc, cur) => acc.concat(cur));
	}

	getDetails(alumni: Alumni) {
		let provider = this.providerFor(alumni[Field.SOURCE]);
		return provider.getDetails(alumni);
	}

}