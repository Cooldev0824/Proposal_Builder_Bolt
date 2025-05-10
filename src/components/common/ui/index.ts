/**
 * UI Components
 * 
 * This file exports all UI components for easier imports.
 */

import Button from './Button.vue';
import Input from './Input.vue';
import Select from './Select.vue';

export {
  Button,
  Input,
  Select
};

/**
 * Register all UI components globally
 * 
 * @param {import('vue').App} app - Vue app instance
 */
export function registerUIComponents(app: any) {
  app.component('UiButton', Button);
  app.component('UiInput', Input);
  app.component('UiSelect', Select);
}
