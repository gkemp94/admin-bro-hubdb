import merge from 'lodash/merge';

import Database from "./database";
import Resource from "./resource";
import Table from "./table";

import { ITableConfig } from './table';

interface ICreateDatabaseArgs {
  tables: ITableConfig[];
}

export const createDatabase = async (config: ICreateDatabaseArgs) => {
  const tables = await Promise.all(
    config.tables.map((tableConfig) => {
      return new Table(tableConfig).init();
    })
  );

  const locale = tables.reduce<any>((curr, table) => {
    return merge(curr, table.locale);
  }, {})

  return { tables, locale };
};

export default {
  Database,
  Resource,
};
