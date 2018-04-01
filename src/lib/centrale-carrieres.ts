import {Observable} from "rxjs";
import {parse as hexParse} from "crypto-js/enc-hex";
import {parse as utf8Parse} from "crypto-js/enc-utf8";
import * as Base64 from "crypto-js/enc-base64";
import {SHA512, MD5} from "crypto-js";
import * as crypto from "crypto-js";
import {WordArray} from "../utils/word-array";
import {HTMLDocument, Element, parseHtmlString} from "libxmljs";
import * as FormData from "form-data";

import {UsernamePasswordCredentials} from "./credentials";
import {Fetch, asText} from "../utils/fetch";
import {getLowerClass, splitLen} from "../utils/utils";
import {AlumniProvider, Alumni, FullAlumni, Query, Field, Sex} from "./api";
import {getUpperClass} from "../utils/utils";

const SOURCE = 'cc';
const BATCH_SIZE = 50;
const LOGIN_PAGE = 'https://www.centrale-carrieres.com/err/403.phtml';
const LOGIN_REQ = 'https://www.centrale-carrieres.com/login.php';
const LOGOUT_REQ = 'https://www.centrale-carrieres.com/compte/logout.php';
const SEARCH_REQ = 'https://www.centrale-carrieres.com/annuaire/index.php';
const DETAILS_REQ = 'https://www.centrale-carrieres.com/annuaire/view.php';

function ssha512(cleartext: string, salt?: string): string {
	let actualSalt: WordArray = salt == null ? (crypto.lib.WordArray as any).random(4) : hexParse(salt);
	let plain: WordArray = utf8Parse(cleartext);
	let digest: WordArray = (SHA512 as any)(plain.concat(actualSalt));
	let ssha = '{SSHA512}' + (digest as WordArray).concat(actualSalt).toString(Base64);
	return ssha;
}

function loginForm(challenge: string, acct_name: string, acct_pass: string): FormData {
	let str = acct_name.toUpperCase() + ':' +
		MD5(acct_pass).toString() + ':' +
		challenge;

	let sha512 = ssha512(acct_pass, challenge.substr(0,8));
	let response = MD5(str).toString();

	let form = new FormData();
	form.append('challenge', challenge);
	form.append('sha512', sha512);
	form.append('response', response);
	form.append('redirect', '/annuaire/index.php');
	form.append('acct_name', acct_name);
	form.append('acct_pass', '');
	return form;
}

function getChallenge(doc: HTMLDocument): Element {
	let input = doc.get('//input[@name="challenge"]');
	if (input == null) throw new Error();
	return input;
}

function getLastOffset(doc: HTMLDocument): number {
	return doc.find('//input[@title="Fin"]')
		.map(last => last.attr('onclick').value().split('start=').pop() || '0')
		.map(last => parseInt(last.substr(0, last.length - 1), 10))
		.shift()!;
};

function extractId(text: string): string {
	return text.split('id=').pop()!;
}

function getAlumnis(doc: HTMLDocument): Alumni[] {
	return doc.find('//tr[@class="Tmpl_Table_List0" or @class="Tmpl_Table_List1"]')
		.map(tr => tr.find('td'))
		.map(tds => {
			let id = extractId(tds[7].get('a')!.attr('href').value());
			return {
				[Field.LAST_NAME]: tds[0].text().trim(),
				[Field.FIRST_NAME]: tds[1].text().trim(),
				[Field.COMPANY]: [tds[2].text().trim()],
				[Field.SCHOOL]: tds[3].text().split('Centralien de').pop()!.trim(),
				[Field.CLASS]: parseInt(tds[4].text().trim() || '', 10),
				[Field.ID]: id,
				[Field.URL]: DETAILS_REQ + '?id=' + id,
				[Field.SOURCE]: SOURCE
			}
		});
}

function queryForm(query: Query) {
	let updated = {
		[Field.FIRST_NAME]: '',
		[Field.LAST_NAME]: '',
		[Field.CLASS]: '',
		[Field.COMPANY]: '',
		...query
	};

	let form = new FormData();
	form.append('prenom', updated[Field.FIRST_NAME]);
	form.append('nom', updated[Field.LAST_NAME]);
	form.append('statut', 1);
	form.append('perso_ville', '');
	form.append('perso_pays', 1);
	form.append('pro_fonction_desc', '');
	form.append('pro_organisation', updated[Field.COMPANY]);
	form.append('type', 1);
	form.append('promo1', getLowerClass(updated[Field.CLASS]));
	form.append('promo2', getUpperClass(updated[Field.CLASS]));
	form.append('Rechercher', 'Rechercher');
	return form;
};

function getCoords(doc: HTMLDocument): string[][] {
	return doc.find('//table[@class="Tmpl_Table_Fiche"]//table//td')
		.map(td => td.text())
		.map(td => td.split('\n')
			.map(l => l.trim())
			.filter(l => l.length > 0))
		.filter(td => td.length > 0);
}

function populateRes(res: {[k: string]: string[]}, line: string) {
	if (line.indexOf(':') === -1) {
		return res;
	} else {
		let s = splitLen(line, ':', 2).map(s => s.trim());
		let k = s.shift()!
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/\s/g, '_')
			.replace(/\./g, '');
		let v = s.shift() || null;
		return { ...res, [k]: (res[k] || []).concat(v === null ? [] : [v]) };
	}
}

const NAME_REGEX = /^((?:M.|Mme) )?(.+) (.+) \(Centralien de (\w+) \/ ([0-9]{4}) \)$/i;
function formatCoords(coords: string[][], alumni: Alumni): FullAlumni {
	if (coords.length == 0) return alumni as FullAlumni;
	let mainCoords = coords.shift()!.slice(0, 3).join(' ').trim();
	let exec = NAME_REGEX.exec(mainCoords) || Array.from({length: 6}, x => '?');
	let res = {
		[Field.SEX]: exec[1].trim() as Sex,
		[Field.FIRST_NAME]: exec[2],
		[Field.LAST_NAME]: exec[3],
		[Field.SCHOOL]: exec[4],
		[Field.CLASS]: parseInt(exec[5], 10)
	};
	let others: {[k: string]: string[]} = coords.reduce((other, lines) => lines.reduce(populateRes, other), {});
	return {
		...alumni,
		...res,
		[Field.EMAIL]: others.courriel || [],
		[Field.PHONE]: (others.mob || []).concat(others.tel || []),
		[Field.COMPANY]: others.organisation || []
	};
};

export default class CentraleCarrieres implements AlumniProvider<UsernamePasswordCredentials> {

	private fetch: Fetch;

	private searchPaged(query: Query, start: number, last?: number): Observable<Alumni> {
		let form = queryForm(query);
		return this.fetch(SEARCH_REQ + '?start=' + start, { method: 'POST', body: form, headers: form.getHeaders() })
			.flatMap(asText)
			.map(parseHtmlString)
			.flatMap(doc => {
				last = last == null ? getLastOffset(doc) : last;
				let next = start + BATCH_SIZE;
				return Observable.from(getAlumnis(doc))
					.concat(next <= last ? this.searchPaged(query, next, last) : Observable.from([]));
			});
	}

	constructor(fetch: Fetch) {
		this.fetch = fetch;
	}

	source() {
		return SOURCE;
	}

	login(creds: UsernamePasswordCredentials) {
		return this.fetch(LOGIN_PAGE)
			.flatMap(asText)
			.map(parseHtmlString)
			.map(getChallenge)
			.map(input => loginForm(input.attr('value').value(), creds.username, creds.password))
			.flatMap(form => this.fetch(LOGIN_REQ, {method: 'POST', body: form, headers: form.getHeaders()}))
			.map(res => res.status === 200);
	}

	logout() {
		return this.fetch(LOGOUT_REQ).map(_ => true);
	}

	search(query: Query) {
		return this.searchPaged(query, 0);
	}

	getDetails(alumni: Alumni) {
		return this.fetch(alumni[Field.URL])
			.flatMap(asText)
			.map(parseHtmlString)
			.map(getCoords)
			.map(coords => formatCoords(coords, alumni));
	}
}