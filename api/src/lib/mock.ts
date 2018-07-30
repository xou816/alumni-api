import {Observable} from "rxjs";
import {Alumni, AlumniProvider, Field, Query, Meta, Sex} from "./api";
import {Keyring, UsernamePasswordCredentials} from "./credentials";

type Cursor = number;

const mocked = [
	{
		[Field.ID]: 0,
		[Field.SOURCE]: 'mock',
		[Field.URL]: '',
		[Field.FIRST_NAME]: 'Patrick',
		[Field.LAST_NAME]: 'Star',
		[Field.CLASS]: 1990,
		[Field.COMPANY]: ['Krusty Krabs'],
		[Field.SEX]: 'M.' as Sex,
		[Field.SCHOOL]: 'Bikini Bottom High',
		[Field.EMAIL]: [],
		[Field.PHONE]: []
	},
	{
		[Field.ID]: 1,
		[Field.SOURCE]: 'mock',
		[Field.URL]: '',
		[Field.FIRST_NAME]: 'Sponge Bob',
		[Field.LAST_NAME]: 'Squarepants',
		[Field.CLASS]: 1990,
		[Field.COMPANY]: ['Krusty Krabs'],
		[Field.SEX]: 'M.' as Sex,
		[Field.SCHOOL]: 'Bikini Bottom High',
		[Field.EMAIL]: [],
		[Field.PHONE]: []
	},
	{
		[Field.ID]: 2,
		[Field.SOURCE]: 'mock',
		[Field.URL]: '',
		[Field.FIRST_NAME]: 'Sandy',
		[Field.LAST_NAME]: 'Cheeks',
		[Field.CLASS]: 1986,
		[Field.COMPANY]: ['Acme'],
		[Field.SEX]: 'Mme' as Sex,
		[Field.SCHOOL]: 'Bikini Bottom High',
		[Field.EMAIL]: [],
		[Field.PHONE]: []
	},
	{
		[Field.ID]: 3,
		[Field.SOURCE]: 'mock',
		[Field.URL]: '',
		[Field.FIRST_NAME]: 'Eugene',
		[Field.LAST_NAME]: 'Krabs',
		[Field.CLASS]: 1980,
		[Field.COMPANY]: ['Krusty Krabs'],
		[Field.SEX]: 'M.' as Sex,
		[Field.SCHOOL]: 'Bikini Bottom High',
		[Field.EMAIL]: [],
		[Field.PHONE]: []
	},
	{
		[Field.ID]: 4,
		[Field.SOURCE]: 'mock',
		[Field.URL]: '',
		[Field.FIRST_NAME]: 'Pearl',
		[Field.LAST_NAME]: 'Krabs',
		[Field.CLASS]: 1992,
		[Field.COMPANY]: [],
		[Field.SEX]: 'Mme' as Sex,
		[Field.SCHOOL]: 'Bikini Bottom High',
		[Field.EMAIL]: [],
		[Field.PHONE]: []
	}
]

export class MockAlumniProvider implements AlumniProvider<any, {}, Cursor> {

	source() {
		return 'mock';
	}

	login(credentials: any) {
		return Observable.of(true);
	}

	logout() {
		return Observable.of(true);
	}

	search(query: Query, cursor: Cursor|null) {
		return Observable.from(mocked)
			.filter(alumni => 
				(query[Field.FIRST_NAME] == null || alumni[Field.FIRST_NAME]!.toLowerCase() === query[Field.FIRST_NAME]!.toLowerCase()) &&
				(query[Field.LAST_NAME] == null || alumni[Field.LAST_NAME]!.toLowerCase() === query[Field.LAST_NAME]!.toLowerCase()) &&
				(query[Field.COMPANY] == null || alumni[Field.COMPANY]!.find(c => c.toLowerCase() === query[Field.COMPANY]!.toLowerCase()) != null) &&
				(query[Field.CLASS] == null || alumni[Field.CLASS]!.toString().toLowerCase() === query[Field.CLASS]!.toLowerCase()))
			.map(node => ({node, cursor: {c:Math.random().toString().substring(2, 8)}}))
			.delay(2000);
	}

	getDetails(meta: Meta) {
		return Observable.from(mocked)
			.find(alumni => alumni[Field.ID] === meta[Field.ID])
			.delay(1500);
	}

}

