import { PropertyType } from "admin-bro";
import { IColumnType, IRowValue, IDateTimeType, IBooleanType, IImageType, IOption } from "../types";
import Property from "../property";

export const columnTypeToAdminBroType = (type: IColumnType): PropertyType | IColumnType => {
  switch(type) {
    case 'TEXT':
    case 'RICHTEXT':
    case 'URL':

    case 'CURRENCY':
    case 'NUMBER':
      return 'number';
    case 'DATE':
      return 'date';
    case 'DATETIME':
      return 'datetime';
    case 'BOOLEAN':
      return 'boolean';
    case 'LOCATION': // TODO: Implement
    // case 'MULTISELECT': // TODO: Implement
    case 'SELECT': // TODO: Implement
      return 'string';
    /*
    case 'MULTISELECT':
      return 'string';
    case 'IMAGE': // TODO: Improvement
      return 'string';
    */
    default:
      return type.toLowerCase() as any;
      throw new Error(`Unknown Type, ${type}`);
  }
}

export const convertToValue = (value: any, property: Property): IRowValue => { // FIXME
  const type: IColumnType = property.columnType();
  switch (type) {
    case "DATE":
      return value.getTime();
    case "BOOLEAN":
      return value ? 1 : 0;
    case "IMAGE":
      return { url: value, type: 'image' };
    case "SELECT":
      return property.columnOptions()!.find((opt: IOption) => opt.name === value)!;
    case "NUMBER":
      return Number(value);
    case "TEXT":
    case "RICHTEXT":
    case "URL":
      return value;
    default:
      return value;
      throw new Error(`Unknown Type ${type}, ${value}`);
  }
};

export const convertFromValue = (value: IRowValue, property: Property): string | boolean | Date => {
  const type = property.columnType();
  switch (type) {
    case "DATE":
      return new Date(value as IDateTimeType);
    case "BOOLEAN":
      return Boolean(value as IBooleanType);
    case "IMAGE":
      return (value as IImageType).url;
    case "SELECT":
      return (value as IOption).name;
    case "TEXT":
    case "NUMBER":
    case "RICHTEXT":
    case "URL":
      return (value as string);
    default:
      return value as any;
      throw new Error(`Unknown Type ${type}, ${value}`);
  }
};
