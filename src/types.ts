import Table from "./table";

export interface IResourceArgs {
  table: Table;
}

export interface ISortOptions {
  sortBy: string;
  direction: 'asc' | 'desc';
}

export interface IFindOptions {
  limit: number;
  offset: number;
  sort?: ISortOptions;
}

export interface ILocationType {
  lat: number;
  long: number;
  type: 'location';
}

export interface IImageType {
  url: string;
  width?: number;
  height?: number;
  type: 'image';
}

export type IDateTimeType = number;

export type IBooleanType = number;

export type IRowValue = string | number | boolean | ILocationType | IImageType | IDateTimeType | IBooleanType | IOption[] | IOption;

export type IColumnType = 'TEXT' | 'RICHTEXT' | 'URL' | 
  'IMAGE' | 'SELECT' | 'MULTISELECT' | 'DATE' | 
  'DATETIME' | 'NUMBER' | 'CURRENCY' | 'BOOLEAN' | 
  'LOCATION';

export interface IOption {
  id: string;
  name: string;
  type: string;
  order: number | null;
}

export interface ITableRow {
  createdAt: string;
  id: string;
  path?: string;
  name?: string;
  childTableId?: string;
  values: {
    [index: string]: IRowValue;
  }
};

export interface IResponseData {
  total: number;
  results: ITableRow[];
};

export interface IColumnConfig {
  id: number;
  name: string;
  label: string;
  foreignIdsByName?: {}; // FIXME
  foreignIdsById?: {}; // FIXME
  archived: boolean;
  type: IColumnType;
  options?: IOption[];
  optionCount?: number;
};

export type IValues = { [index: string]: IRowValue };

export interface ITableMeta {
  label: string;
}
