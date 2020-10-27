import { Badge, FormGroup, Label, ShowPropertyProps, unflatten } from 'admin-bro';
import React from 'react';

export default ({  property, record }: ShowPropertyProps) => {
  const value = unflatten(record.params)[property.name] || undefined;
  return (
    <img src={value} style={{maxWidth: '100px' }} alt=""/>
  );
}
