import {Observable} from "rxjs";
import {AlumniProvider, Alumni, Field, Query} from "./api";
import {UsernamePasswordCredentials, Keyring, AggregatedCredentials} from "./credentials";

export class AggregatedAlumniProvider implements AlumniProvider<UsernamePasswordCredentials> {

	protected providers: AlumniProvider<any>[];
	protected keyring: Keyring<UsernamePasswordCredentials>;

	constructor(providers: AlumniProvider<any>[], keyring: Keyring<UsernamePasswordCredentials>) {
		this.providers = providers;
		this.keyring = keyring;
	}

	protected providerFor(source: string): AlumniProvider<any> {
		let provider = this.providers
			.filter(p => p.source() === source).shift();
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

	search(query: Query) {
		return Observable.merge(...this.providers.map(p => p.search(query)));
	}

	getDetails(alumni: Alumni) {
		let provider = this.providerFor(alumni[Field.SOURCE]);
		return provider.getDetails(alumni);
	}

}

export function getLowerClass(class_: string): string {
	return class_.split('-')[0];
}

export function getUpperClass(class_: string): string {
	let s = class_.split('-');
	return s[s.length - 1];
}