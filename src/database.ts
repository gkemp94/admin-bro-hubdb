import { BaseDatabase } from "admin-bro";
import Resource from "./resource";
import Table from "./table";

export interface IDatabaseConfig {
  tables: Table[];
}

class Database extends BaseDatabase {
  private _tables: Table[];
  constructor({ tables }: IDatabaseConfig) {
    super({ tables });
    this._tables = tables;
  }

  static isAdapterFor(database: any): boolean {
    return database.tables;
  }

  resources(): Resource[] {
    return this._tables.map(table => new Resource({ table })); 
  }
}

export default Database;
