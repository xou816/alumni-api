import {Observable} from "rxjs";
import {HTMLDocument, Element, parseHtmlString} from "libxmljs";
import * as FormData from "form-data";
import {stringify} from "querystring";

import {UsernamePasswordCredentials} from "./credentials";
import {Fetch, asText} from "../utils/fetch";
import {trimInner, flatten, getLowerClass} from "../utils/utils";
import {AlumniProvider, Search, Alumni, FullAlumni, Query, Field, Sex, Meta} from "./api";
import {getUpperClass} from "../utils/utils";

const BATCH_SIZE = 20;
const SOURCE = 'alumnis';
const FIRST_PAGE = 'https://annuaire.centraliens-nantes.net';
const LOGIN_REQ = 'https://annuaire.centraliens-nantes.net/index.php/login';
const LOGOUT_REQ = 'https://annuaire.centraliens-nantes.net/index.php/logout';
const SEARCH_REQ = 'https://annuaire.centraliens-nantes.net/index.php/annuaire/search';
const DETAILS_REQ = 'https://annuaire.centraliens-nantes.net/index.php/annuaire/show/individu_id/';

const NAME_REGEX = /^([-A-Z ]+)( (?:[A-Z][-a-zÀ-ú]+ ?)+)(?:\(née ([-A-Z ]+)\))?$/;
function getAlumnis(doc: HTMLDocument): Alumni[] {
	return doc.find('//div[@id="content"]//table[@class="striped"]//tr')
		.map(tr => tr.find('td'))
		.map(tds => {
			let id = tds[0].get('a')!.attr('href').value().split('individu_id/').pop() || null;
			let fixed = trimInner(tds[0].text());
			let res = NAME_REGEX.exec(fixed) || Array.from({length: 4}, x => '');
			let born = res[3] != null ? ' ' + res[3].trim() : '';
			return {
				[Field.ID]: id,
				[Field.SOURCE]: SOURCE,
				[Field.URL]: DETAILS_REQ + id,
				[Field.LAST_NAME]: res[1].trim() + born,
				[Field.FIRST_NAME]: res[2].trim(),
				[Field.CLASS]: parseInt(tds[1].text() || '', 10)
			};
		});
}

function getLastPage(doc: HTMLDocument): number {
	return doc
		.find('//div[@id="content"]//div[@class="center paginate"][1]/a[last()]')
		.map(last => parseInt(last.attr('href').value().split('/').pop() || '0', 10))
		.shift()!;
}

const queryMapper: {[k: string]: string} = {
	[Field.FIRST_NAME]: 'individu_prenom',
	[Field.LAST_NAME]: 'individu_nom',
	classLower: 'promotion_debut',
	classUpper: 'promotion_fin',
	[Field.COMPANY]: 'entreprise_nom'
};

function buildQuery(query: Query, page: number): string {
	let fixedQuery: {[k:string]: string|undefined} = {
		...query, 
		classLower: getLowerClass(query[Field.CLASS] || ''), 
		classUpper: getUpperClass(query[Field.CLASS] || '')
	};
	return SEARCH_REQ + '?' + stringify(Object.keys(fixedQuery).reduce((acc: {[k: string]: string}, key: string) => {
		acc['recherche[' + (queryMapper[key] || key) + ']'] = fixedQuery[key]!;
		return acc;
	}, {commit: 'Rechercher', page: page.toString()}));
}

const JOB_REGEX = /^(.+) \([0-9]{4}[A-Z]\) - \((.+) à (.+)\)$/i;
const EMAIL_REGEX = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
const PHONE_REGEX = /^((?:[0-9]{2}[-\.]?){5})(?: \([\w ]+\))?$/i;

function parseJob(job: Element) {
	job.find('br').map(br => (br as any).replace('\n'));
	let splitted = job.text().split('\n').map(s => s.trim());
	splitted.shift();
	let company = (JOB_REGEX.exec(splitted.shift() || '') || ['', ''])[1];
	let emails = splitted
		.map(frag => EMAIL_REGEX.exec(frag))
		.filter(res => res != null)
		.map(res => res![0]);
	let phones = splitted
		.map(frag => PHONE_REGEX.exec(frag))
		.filter(res => res != null)
		.map(res => res![1]);
	return {
		[Field.COMPANY]: company, 
		[Field.EMAIL]: emails, 
		[Field.PHONE]: phones
	};
}

const SEX_REGEX = /^Fiche de (M\.|Mme) (?:.*)$/i;
const DIPLOMA_REGEX = /^Ingénieur - Ecole Centrale de Nantes \(([0-9]{2,4})\)$/i;

function parseAlumni(doc: HTMLDocument, alumni: Alumni): FullAlumni {
	let sex = doc.find('//div[@class="typography"]/h3')
		.map(e => e.text())
		.map(t => SEX_REGEX.exec(t))
		.filter(r => r != null)
		.map(r => r![1] as Sex);
	let identity = doc.find('//div[@class="typography"]//td')
		.map(td => td.text())
		.map(trimInner);
	let diplomas = doc.find('//div[@class="typography"]//fieldset[2]//li')
		.map(li => li.text());
	let coords = doc.find('//div[@id="coords"]/div');
	let nthCoord = (i: number) => coords[i].find('.//dd').map(dd => dd.text().trim());
	let jobs = doc.find('//div[@class="typography"]//fieldset[4]/ul/li')
		.map(parseJob);
	let class_ = diplomas.map(d => DIPLOMA_REGEX.exec(d))
		.filter(res => res != null)
		.map(res => parseInt(res![1], 10));
	return {
		...alumni,
		[Field.SEX]: sex.shift() || '?',
		[Field.LAST_NAME]: identity[0].trim(),
		[Field.FIRST_NAME]: identity[1].trim(),
		[Field.PHONE]: nthCoord(1).concat(flatten(jobs.map(j => j[Field.PHONE]))),
		[Field.EMAIL]: nthCoord(2).concat(flatten(jobs.map(j => j[Field.EMAIL]))),
		[Field.COMPANY]: jobs.map(j => j[Field.COMPANY]),
		[Field.SCHOOL]: 'Nantes',
		[Field.CLASS]: class_.shift() || 0
	};
}

type Cursor = {
	page: number,
	skip?: number 
	last?: number
};

export default class Alumnis implements AlumniProvider<UsernamePasswordCredentials, {}, Cursor> {

	private fetch: Fetch;

	private searchPaged(query: Query, cursor: Cursor): Search<Alumni> {
		return this.fetch(buildQuery(query, cursor.page))
			.flatMap(asText)
			.map(parseHtmlString)
			.flatMap(doc => {
				let last = cursor.last || getLastPage(doc);
				let next = cursor.page + 1;
				return Observable.from(getAlumnis(doc))
					.skip(cursor.skip || 0)
					.map((alumni, skip) => ({ node: alumni, cursor: {...cursor, last, skip} }))
					.concat(next <= last ? this.searchPaged(query, {...cursor, last, page: next, skip: 0}) : Observable.from([]));
			});
	}

	constructor(fetch: Fetch) {
		this.fetch = fetch;
	}

	source() {
		return SOURCE;
	}

	login(creds: UsernamePasswordCredentials) {
		let body = stringify({
			'signin[username]': creds.username,
			'signin[password]': creds.password
		});
		let headers = {
			'content-type': 'application/x-www-form-urlencoded',
			'content-length': body.length.toString(),
			'user-agent': ''
		};
		return this.fetch(FIRST_PAGE)
			.flatMap(_ => this.fetch(LOGIN_REQ, { method: 'POST', body: body, headers: headers }))
			.flatMap(asText)
			.map(_ => true);
	}

	logout() {
		return this.fetch(LOGOUT_REQ).map(_ => true);
	}

	search(query: Query, cursor: Cursor|null) {
		let next: Cursor;
		if (cursor === null) {
			next = {page: 1};
		} else {
			let {page, skip, last} = {skip: 0, ...cursor};
			next = skip + 1 === BATCH_SIZE ?
				{page: page + 1, skip: 0, last} :
				{page, skip: skip + 1, last};
		}
		return this.searchPaged(query, next);
	}

	getDetails(meta: Meta) {
		let alumni = {...meta, [Field.URL]: DETAILS_REQ + meta.id};
		return this.fetch(alumni[Field.URL])
			.flatMap(asText)
			.map(parseHtmlString)
			.map(doc => parseAlumni(doc, alumni));		
	}


}