import AdminBro from 'admin-bro';
import path from 'path';

export const safelyGetComponent = (component: string) => {
  try {
    return AdminBro.bundle(path.resolve(__dirname, `../components/${component}`))
  } catch (e) {
    return undefined;
  }
}
