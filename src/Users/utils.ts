import { Filter, MappedFilter, MappedOrderBy, FieldID, OrderBy } from './types';
import { FIELDS } from './consts';

export function rjust (input: number): string {
  return `${input}`.length === 2 ? `${input}` : `0${input}`
}

export function formatLastActive (lastActive: number): string {
  const date = new Date(lastActive);
  return `${rjust(date.getUTCDate())}/${rjust(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`
}

export function mapFilters (filters: { [path: string]: Filter }): Array<MappedFilter> {
  return Object.keys(filters).map((path: string): MappedFilter => {
  	let realPath = path;
  	if (path === FIELDS.lastActiveStart || path === FIELDS.lastActiveEnd) realPath = FIELDS.lastActive;
    const { condition, value } = filters[path];
    return [realPath, condition, value];
  })
}

export function mapOrderBys (orders: { [path: string]: OrderBy }): Array<MappedOrderBy> {
  function sortOrdersByPriority (orderPathA: string, orderPathB: string): number {
    return orders[orderPathA].priority - orders[orderPathB].priority;
  }

  return Object.keys(orders).sort(sortOrdersByPriority).map((path: string): MappedOrderBy => {
    const { order } = orders[path];
    return [path as FieldID, order];
  });
}

export function findMaxOrdersPriority (orders: { [path: string]: OrderBy }): number {
  return Object.values(orders).map(o => o.priority).sort((a, b) => b - a)[0] || 0;
}
