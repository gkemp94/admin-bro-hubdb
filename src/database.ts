import { BaseDatabase, BaseResource } from "admin-bro";
import Resource from "./resource";
import Table from "./table";

export interface IDatabaseConfig {
  tables: Table[];
}

class Database extends BaseDatabase {
  private tables: Table[];
  constructor({ tables }: IDatabaseConfig) {
    super({ tables });
    this.tables = tables;
  }

  static isAdapterFor(database: IDatabaseConfig): boolean {
    return Boolean(database.tables);
  }

  resources(): BaseResource[] {
    return this.tables.map(table => new Resource({ table })); 
  }
}

export default Database;
