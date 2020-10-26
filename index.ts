import Database from "./src/database";
import Resource from "./src/resource";
import Table, { ITableConfig } from "./src/table";

interface ICreateDatabaseArgs {
  tables: ITableConfig[];
}

export const createDatabase = async (config: ICreateDatabaseArgs) => {
  const tables = await Promise.all(
    config.tables.map((tableConfig) => {
      return new Table(tableConfig).init();
    })
  );
  return new Database({ tables });
};

export default {
  Database,
  Resource,
};
