import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { IColumnConfig, IResponseData, ITableMeta, ITableRow, IValues } from "./types";

export interface ITableConfig extends ITableOptions {
  tableId: number;
  label?: string;
};
interface ITableOptions {
  listProperties?: string[];
  parent?: {
    name: string;
    icon: string;
  }
}
class Table {
  static BASE_COLUMNS: IColumnConfig[] = [{
    id: -1,
    name: 'id',
    label: 'id',
    archived: false,
    type: 'TEXT',
  }]

  private _client: AxiosInstance;
  private _tableId: number;
  private _columns?: IColumnConfig[];
  private _cache: ITableRow[] | null = null;
  private _meta?: ITableMeta;
  private _label?: string;
  private _options: ITableOptions; // FIXME

  constructor({ tableId, label, ...options }: ITableConfig) {
    const baseURL = `https://api.hubapi.com/cms/v3/hubdb/tables/${tableId}`;
    this._tableId = tableId;
    this._label = label;
    this._options = options;

    // Generate Axios Client for Internal Use
    this._client = axios.create({ baseURL });
    this._client.interceptors.request.use(this.requestInterceptor.bind(this)); 
    this._client.interceptors.response.use(this.responseInterceptor.bind(this));  
  }

  private requestInterceptor(req: AxiosRequestConfig) {
    console.log(`[CMS] Request ${req.baseURL}${req.url}`);
    req.params = req.params || {};
    req.params.hapikey = process.env.HAPIKEY;
    return req;
  }

  private async responseInterceptor(res: AxiosResponse) {
    if (res.data?.paging?.next && res.data.results) {
      const config = res.config;
      const { after } = res.data.paging.next;
      const { data } = await axios({ ...config, params: { ...config.params, after }});
      res.data.results.push(...data.results);
      delete res.data.paging;
    }
    return res;
  }

  get options() {
    return this._options;
  }

  get locale() {
    return {
      translations: {
        labels: {
          [this._tableId]: this._label || this._meta?.label,
        },
        resources: {
          [this._tableId]: {
            properties: this._columns?.reduce<any>((curr, column) => {
              curr[column.name] = column.label || column.name;
              return curr;
            }, {})
          }
        }
      }
    };
  }

  private async publish(): Promise<void> {
    await this._client.post('/draft/push-live', {});
  }

  private clearCache(): void {
    this._cache = null;
  }

  public id() {
    return this._tableId;
  }

  public label() {
    if (!this._meta) {
      throw new Error('Table has not been initalized.');
    }
    return this._meta.label;
  }

  public async init(): Promise<Table> {
    const { columns, ...meta } = await this.get()
    this._columns = [...Table.BASE_COLUMNS, ...columns];
    this._meta = meta;
    return this;
  }

  public columns(): IColumnConfig[] {
    if (!this._columns) {
      throw new Error('Table has not been initalized.');
    }
    return this._columns;
  }

  public async get() {
    const { data } = await this._client.get('');
    return data;
  }
  
  public async count(): Promise<number> {
    const results = await this.listRows();
    return results.length;
  }

  public async createRow(values: IValues): Promise<ITableRow> { // FIXME
    this.clearCache();
    const { data } = await this._client.post('/rows', { values });
    await this.publish();
    return data;
  }

  public async listRows(): Promise<ITableRow[]> {
    if (this._cache) return this._cache;
    const { data } = await this._client.get<IResponseData>('/rows');
    this._cache = data.results;
    return this._cache;
  }

  public async getRowsByIds(inputs: string[]): Promise<ITableRow[]> {
    const { data } = await this._client.post<{ status: string, results: ITableRow[] }>('/rows/batch/read', { inputs });
    return data.results;
  }

  public async getRowById(rowId: string): Promise<ITableRow>  {
    const { data } = await this._client.get(`/rows/${rowId}`);
    return data;
  }

  public async updateRow(rowId: string, values: IValues): Promise<ITableRow> { // TEST
    this.clearCache();
    const { data } = await this._client.patch(`/rows/${rowId}/draft`, { values });
    await this.publish();
    return data;
  }

  public async deleteRow(rowId: string): Promise<void> { // TEST
    this.clearCache();
    await this._client.delete(`/rows/${rowId}/draft`, {});
    return await this.publish();
  }
}

export default Table;
