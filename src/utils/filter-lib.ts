import { BaseRecord, Filter, PropertyType } from "admin-bro";
import { quickScore } from 'quick-score';
import { ISortOptions } from "../types";

interface IDateFilter {
  to?: string;
  from?: string;
}

export const filterRecords = (results: BaseRecord[], { filters }: Filter): BaseRecord[] => {
  const filterKeys = Object.keys(filters);
  return results.filter(item => {
    return filterKeys.every(key => {
      const { path, property, value } = filters[key];
      const type = property.type();
      switch(type) {
        case 'string':
          return quickScore(item.param(path), value) > .8;
        case 'boolean':
          return item.param(path) === Boolean(value);
        case 'number':
          return item.param(path) === Number(value);
        case 'datetime':
          const { to, from } = value as IDateFilter;
          const t = new Date(item.param(path)).getTime();
          return (to ? new Date(to).getTime() >= t  : true)
            && (from ? new Date(from).getTime() <= t : true);
        default:
          return true;
      }
    })
  })
};

export const getSortFunction = (type: PropertyType, path: string, value: -1 | 1): any => {
  switch (type) {
    case 'string':
      return (a: BaseRecord, b: BaseRecord) => {
        const nA = a.param(path)?.toUpperCase();
        const nB = b.param(path)?.toUpperCase();
        return (nA < nB ? -1 : nA > nB ? 1 : 0) * value;
      }
    case 'boolean':
      return (a: BaseRecord, b: BaseRecord) => {
        const nA = a.param(path);
        const nB = b.param(path);
        return (nA === nB ? 0 : nA ? -1 : 1) * value;
      }
    case 'datetime':
    case 'date':
      return (a: BaseRecord, b: BaseRecord) => {
        const nA = new Date(a.param(path) || 0).getTime();
        const nB = new Date(b.param(path) || 0).getTime();
        return (nA < nB ? -1 : nA > nB ? 1 : 0) * value;
      }
  }
};

export const sortRecords = (results: BaseRecord[], sort?: ISortOptions) => {
  if (!results.length || !sort) return results;
  const { direction, sortBy } = sort;
  const property = results[0].resource.property(sortBy)!;
  const type = property.type();
  const value = direction === 'asc' ? 1 : -1;
  const sortFunction = getSortFunction(type, sortBy, value);
  return results.sort(sortFunction);
};
