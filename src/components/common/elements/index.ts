/**
 * Element Components
 * 
 * This file exports all element components for easier imports.
 */

import BaseElement from './BaseElement.vue';

export {
  BaseElement
};

/**
 * Register all element components globally
 * 
 * @param {import('vue').App} app - Vue app instance
 */
export function registerElementComponents(app: any) {
  app.component('BaseElement', BaseElement);
}
