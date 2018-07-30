export function splitLen(str: string, sep: string, len: number): string[] {
	let arr = str.split(sep);
	let res = arr.splice(0, len - 1);
	res.push(arr.join(sep));
	return res;
}

export function flatten<T>(arr: T[][]): T[] {
	return arr.reduce((acc, cur) => acc.concat(cur), []);
}

export function trimInner(str: string) {
	return str.split(' ')
		.map(s => s.trim())
		.filter(s => s.length > 0)
		.join(' ');
}

export function getLowerClass(class_: string): string {
    return class_.split('-')[0];
}

export function getUpperClass(class_: string): string {
    let s = class_.split('-');
    return s[s.length - 1];
}