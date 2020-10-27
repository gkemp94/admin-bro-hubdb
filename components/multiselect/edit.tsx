import { EditPropertyProps, FormGroup, Label, MessageBox } from 'admin-bro'
import React from 'react';
import { withTheme, DefaultTheme } from 'styled-components'

type CombinedProps = EditPropertyProps & {theme: DefaultTheme}


export default withTheme(({ property }: CombinedProps) => {
  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <MessageBox variant="danger" message="Editing Multi Select Values is not Currently Supported" />
    </FormGroup>
  );
});
