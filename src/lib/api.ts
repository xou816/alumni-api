import {Observable} from "rxjs";

export enum Field {
	ID = 'ID', 
	SOURCE = 'SOURCE', 
	URL = 'URL', 
	SEX = 'SEX', 
	FIRST_NAME = 'FIRST_NAME', 
	LAST_NAME = 'LAST_NAME', 
	CLASS = 'CLASS', 
	COMPANY = 'COMPANY',
	SCHOOL = 'SCHOOL',
	EMAIL = 'EMAIL',
	PHONE = 'PHONE'
}

export type Query = Partial<{
	CLASS_1: number|string,
	CLASS_2: number|string,
	[Field.FIRST_NAME]: string,
	[Field.LAST_NAME]: string,
	[Field.COMPANY]: string
}>;

export type Meta = {
	[Field.ID]: string|number|null,
	[Field.SOURCE]: string,
	[Field.URL]: string
}

export type Sex = "M." | "Mme" | "Mlle" | "?";
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

export type Alumni = Meta & Partial<Details>;
export type FullAlumni = Meta & Details;

export interface AlumniProvider {
	name(): string;
	login(username: string, password: string): Observable<boolean>;
	search(query: Query): Observable<Alumni>;
	getDetails(alumni: Alumni): Observable<FullAlumni>;
}