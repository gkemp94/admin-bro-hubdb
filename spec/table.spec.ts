import Table from '../src/table';

describe('Table', () => {
  let table: Table;

  beforeAll(async () => {
    table = await new Table({ tableId: 2896453 }).init();
  });

  it('is an instance of Table', () => {
    expect(table instanceof Table).toBe(true);
  });

  it('.columns() returns column configuration', () => {
    const columns = table.columns();
    expect(Array.isArray(columns)).toBe(true);
  });

  
  it('.count() should return a number', async () => {
    const count = await table.count();
    expect(typeof count).toBe('number');
  });
  it('.listRows() should return an object with total & array of rows', async () => {
    const rows = await table.listRows();
    expect(Array.isArray(rows)).toBe(true);
  });
  it('.getRowsByIds() should return an array of rows', async () => {
    const rows = await table.getRowsByIds(['36658187197']);
    expect(Array.isArray(rows)).toBe(true);
  });
  it('.getRowById() should return a rows', async () => {
    const row = await table.getRowById('36658187197');
    expect(Array.isArray(row)).toBe(true);
  });
  it.todo('.createRow() should return a the new row');
  it.todo('.updateRow() should return an updated row');
  it.todo('.deleteRow() should return void');
  it.todo('.get() should return the table metadata');
})
