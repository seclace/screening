import { Filter } from './types';
import { FIELDS } from './consts';

export function rjust (input: number): string {
  return `${input}`.length === 2 ? `${input}` : `0${input}`
}

export function formatLastActive (lastActive: number): string {
  const date = new Date(lastActive);
  return `${rjust(date.getUTCDate())}/${rjust(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`
}

export function mapFilters (filters: { [path: string]: Filter }): Array<[string, firebase.firestore.WhereFilterOp, any]> {
  return Object.keys(filters).map((path: string): [string, firebase.firestore.WhereFilterOp, any] => {
  	let realPath = path;
  	if (path === FIELDS.lastActiveStart || path === FIELDS.lastActiveEnd) realPath = FIELDS.lastActive;
    const { condition, value } = filters[path];
    return [realPath, condition, value];
  })
}
