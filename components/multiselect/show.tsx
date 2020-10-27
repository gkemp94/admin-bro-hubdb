import { Badge, FormGroup, Label, ShowPropertyProps, unflatten } from 'admin-bro';
import React from 'react';

export default ({  property, record }: ShowPropertyProps) => {
  const values = unflatten(record.params)[property.name] || [];
  return (
    <FormGroup>
      <Label>{property.label}</Label>
      {values.map(({ name, id }) => (
        <Badge style={{ marginRight: '.25rem' }} key={id}>{name}</Badge>
      ))}
    </FormGroup>
  )
}
