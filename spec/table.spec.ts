import Table from '../src/table';

describe('Table', () => {
  let table: Table;

  beforeAll(async () => {
    table = await new Table({ tableId: 1027640 }).init();
  });

  it('is an instance of Table', () => {
    expect(table instanceof Table).toBe(true);
  });

  it('.columns() returns column configuration', () => {
    expect(Array.isArray(table.columns())).toBe(true);
  })
})
