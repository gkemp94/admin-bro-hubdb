import { BaseRecord, BaseResource, Filter } from "admin-bro";
import Property from "./property";
import Table from "./table";
import { convertFromValue, convertToValue } from "./utils/convert-lib";
import { filterRecords, sortRecords } from "./utils/filter-lib";

import { IFindOptions, IResourceArgs, IRowValue, ITableRow } from './types';
import { merge } from "lodash";

class Resource extends BaseResource {
  private _table: Table;
  private _properties: Property[];

  static isAdapterFor(rawResource: any): boolean {
    return rawResource.table;
  }

  constructor({ table }: IResourceArgs) {
    super();
    this._table = table;
    this._properties = table.columns().map((column, index) => new Property({ column, index }));
  }

  get options() {
    return {
      ...this._table.options,
      properties: this._properties.reduce<any>((opts, property) => {
        opts[property.path()] = property.options;
        return opts;
      }, {})
    };
  }

  id(): string {
    return `${this._table.id()}`;
  }

  databaseType(): string {
    return 'hubdb'
  }

  databaseName(): string {
    return 'HubDB';
  }

  properties(): Property[] {
    return this._properties;
  }

  property(path: string): Property {
    return this._properties.find(prop => prop.path() === path)!;
  }

  async count(filter: Filter) {
    const filteredResults = await this.getFilteredResults(filter);
    return filteredResults.length;
  }

  async getFilteredResults(filter: Filter): Promise<BaseRecord[]> {
    const rows = await this._table.listRows();
    const records = rows.map(row => this.toRecord(row));
    return filterRecords(records, filter);
  }

  async find(filters: Filter, { limit, offset, sort }: IFindOptions): Promise<BaseRecord[]> {
    const filteredResults = await this.getFilteredResults(filters);
    const sortedResults = await sortRecords(filteredResults, sort);
    return sortedResults.slice(offset, offset + limit);
  }

  async findMany(ids: string[]): Promise<BaseRecord[]> {
    const rows = await this._table.getRowsByIds(ids);
    return rows.map(row => this.toRecord(row));
  }

  async findOne(rowId: string) {
    const row = await this._table.getRowById(rowId);
    return this.toRecord(row);
  }

  async delete(rowId: string) {
    await this._table.deleteRow(rowId);
  }

  async update(rowId: string, values: any) { // FIXME
    this._table.updateRow(rowId, this.toValue(values));
    return this.findOne(rowId);
  }

  async create(values: any) {
    const row = await this._table.createRow(this.toValue(values))
    return this.toRecord(row);
  }

  private toRecord({ values, id }: ITableRow): BaseRecord {
    const processedValues = Object.keys(values).reduce<{ [index: string ] : any }>((curr, key) => {
      const property = this.property(key);
      curr[key] = convertFromValue(values[key], property);
      return curr;
    }, {});
    return new BaseRecord({ ...processedValues, id }, this);
  }

  private toValue({ id, ...values }: any): {[index: string]: IRowValue} { // FIXME
    return Object.keys(values).reduce<any>((curr, key) => {
      const property = this.property(key);
      curr[key] = convertToValue(values[key], property);
      return curr;
    }, {});
  }
}

export default Resource;
