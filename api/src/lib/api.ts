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

export type Meta<I = Id> = {
	[Field.ID]: I,
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

export type Id = {
	key: string,
	source: string
};

export type Alumni<I = Id> = Meta<I> & Partial<Details>;
export type FullAlumni<I = Id> = Meta<I> & Details;

export type Node<R, N = any> = {node: R, cursor: N|null};
export type Search<R, N = any> = Observable<Node<R, N>>;

export interface AlumniProvider<C, I extends {} = Id, E = {}, N = any> {
	source(): string;
	login(credentials: C): Observable<boolean>;
	logout(): Observable<boolean>;
	search(query: Query, cursor: N|null): Search<Alumni<I>>;
	get(id: I): Observable<FullAlumni<I> & E>;
	has(id: I): boolean;
}
