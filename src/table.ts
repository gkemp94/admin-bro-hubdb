import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export interface ITableConfig {
  tableId: number;
};

type IRowValue = string | boolean | number; // FIXME
type IColumnType = 'TEXT'; // FIXME

interface ITableRow {
  createdAt: string;
  id: string;
  path?: string;
  name?: string;
  childTableId?: string;
  values: {
    [index: string]: IRowValue;
  }
};

interface IResponse {
  total: number;
  results: ITableRow[];
};

interface IColumnConfig {
  id: number;
  name: string;
  label: string;
  archived: boolean;
  type: IColumnType;
};

type IValues = { [index: string]: IRowValue };

class Table {
  private _client: AxiosInstance;
  private _tableId: number;
  private _columns?: IColumnConfig[];
  private _cache: IResponse | null = null;

  constructor({ tableId }: ITableConfig) {
    const baseURL = `https://api.hubapi.com/cms/v3/hubdb/tables/${tableId}`;
    this._tableId = tableId;

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

  private async publish() {
    await this._client.post('/draft/push-live', {});
  }

  private clearCache() {
    this._cache = null;
  }

  public id() {
    return this._tableId;
  }

  public async init(): Promise<Table> {
    const { columns } = await this.get()
    this._columns = columns;
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
    const { total } = await this.listRows();
    return total;
  }

  public async createRow(values: IValues) { // FIXME
    this.clearCache();
    const { data } = await this._client.post('/rows', { values });
    await this.publish();
    return data;
  }

  public async listRows(): Promise<IResponse> { // TEST
    if (this._cache) return this._cache;
    const { data } = await this._client.get('/rows');
    this._cache = data;
    return data;
  }

  public async getRowsByIds(inputs: string[]): Promise<ITableRow[]> { // TEST
    const { data } = await this._client.post('/rows/batch/read', { inputs });
    return data;
  }

  public async getRowById(rowId: string): Promise<ITableRow>  { // TEST
    const { data } = await this._client.get(`/rows/${rowId}`);
    return data;
  }

  public async updateRow(rowId: string, values: IValues): Promise<ITableRow> {
    this._cache = null;
    const { data } = await this._client.patch(`/rows/${rowId}/draft`, { values });
    await this.publish();
    return data;
  }

  public async deleteRow(rowId: string): Promise<void> {
    this._cache = null;
    await this._client.delete(`/rows/${rowId}/draft`, {});
    return await this.publish();
  }
}

export default Table;
