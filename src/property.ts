import { BaseProperty, PropertyType } from "admin-bro";
import { IColumnConfig, IColumnType, IOption } from './types';
import { safelyGetComponent } from "./utils/component-lib";
import { columnTypeToAdminBroType } from './utils/convert-lib';

interface IPropertyType {
  column: IColumnConfig;
  index: number;
}

class Property extends BaseProperty {
  // Custom HubDB Metadata
  private _columnType: IColumnType;
  private _columnOptions?: IOption[];
  private _index: number;
  private _label: string;

  constructor({ column, index }: IPropertyType) {
    super({
      path: column.name,
      isId: column.name === 'id',
      isSortable: true,
      type: columnTypeToAdminBroType(column.type) as PropertyType,
      position: index,
    });
    this._index = index;
    this._columnType = column.type;
    this._columnOptions = column.options;
    this._label = column.label;
  }

  get options() {
    return {
      components: ['edit', 'show', 'filter', 'list'].reduce<any>((curr, key) => {
        curr[key] = safelyGetComponent(`${this._columnType.toLowerCase()}/${key}.tsx`);
        return curr;
      }, {})
    };
  }

  isEditable(): boolean {
    return !this.isId();
  }

  availableValues(): string[] | null {
    if (!this._columnOptions) return null;
    return this._columnOptions?.map(({  name }) => name);
  }

  position(): number {
    return this.isId() ? 0 : this._index;
  }

  isArray(): boolean {
    return false;
  }

  label(): string {
    return this._label;
  }

  isTitle(): boolean {
    return false;
  }

  subProperties(): Property[] {
    return []
  }

  isRequired(): boolean {
    return false;
  }

  columnOptions() {
    return this._columnOptions;
  }

  columnType() {
    return this._columnType;
  }
}

export default Property;
