/**
 * Layout Components
 * 
 * This file exports all layout components for easier imports.
 */

import MainLayout from './MainLayout.vue';

export {
  MainLayout
};

/**
 * Register all layout components globally
 * 
 * @param {import('vue').App} app - Vue app instance
 */
export function registerLayoutComponents(app: any) {
  app.component('MainLayout', MainLayout);
}
