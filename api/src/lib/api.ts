import {Observable} from "rxjs";

export enum Field {
	ID = 'id', 
	SOURCE = 'source', 
	URL = 'url', 
	SEX = 'sex', 
	FIRST_NAME = 'first_name', 
	LAST_NAME = 'last_name', 
	CLASS = 'class', 
	COMPANY = 'company',
	SCHOOL = 'school',
	EMAIL = 'email',
	PHONE = 'phone'
}

export type Query = Partial<{
	[Field.SOURCE]: string,
	[Field.CLASS]: string,
	[Field.FIRST_NAME]: string,
	[Field.LAST_NAME]: string,
	[Field.COMPANY]: string
}>;

export type Meta = {
	[Field.ID]: string|number|null,
	[Field.SOURCE]: string
}

export type Sex = "M." | "Mme" | "?";
export type Details = {
	[Field.SEX]: Sex,
	[Field.FIRST_NAME]: string,
	[Field.LAST_NAME]: string,
	[Field.CLASS]: number,
	[Field.COMPANY]: string[],
	[Field.SCHOOL]: string,
	[Field.EMAIL]: string[],
	[Field.PHONE]: string[] 
}

export type Alumni = Meta &	{[Field.URL]: string} & Partial<Details>;
export type FullAlumni = Meta &	{[Field.URL]: string} & Details;

export type Node<R, N = any> = {node: R, cursor: N|null};
export type Search<R, N = any> = Observable<Node<R, N>>;

export interface AlumniProvider<C, E = {}, N = any> {
	source(): string;
	login(credentials: C): Observable<boolean>;
	logout(): Observable<boolean>;
	search(query: Query, cursor: N|null): Search<Alumni>;
	getDetails(meta: Meta): Observable<FullAlumni & E>;
}
