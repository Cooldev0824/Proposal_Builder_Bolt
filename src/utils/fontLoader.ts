/**
 * Font loader utility
 * 
 * This file provides utilities for loading fonts from Google Fonts.
 */

import { FontFamily } from './fontTypes';
import { ALL_FONTS } from './fontData';

/**
 * Filter system fonts from the font list
 * 
 * @returns {FontFamily[]} Array of fonts that need to be loaded from Google Fonts
 */
export function getGoogleFonts(): FontFamily[] {
  // System fonts that don't need to be loaded from Google Fonts
  const systemFonts = [
    'Arial', 
    'Helvetica', 
    'Verdana', 
    'Georgia', 
    'Times New Roman', 
    'Courier New', 
    'Consolas'
  ];
  
  return ALL_FONTS.filter(font => !systemFonts.includes(font.name));
}

/**
 * Generate Google Fonts URL for the application
 * 
 * @param {FontFamily[]} fonts - Array of fonts to include in the URL
 * @param {string[]} weights - Font weights to load (default: ['300', '400', '500', '700'])
 * @returns {string} Google Fonts URL
 */
export function generateGoogleFontsUrl(
  fonts: FontFamily[] = getGoogleFonts(),
  weights: string[] = ['300', '400', '500', '700']
): string {
  // Format the font names for the URL
  const formattedFonts = fonts.map(font => {
    // Replace spaces with + and format the font name
    const formattedName = font.value.replace(/\s+/g, '+');
    
    // Add weights
    return `${formattedName}:wght@${weights.join(';')}`;
  });
  
  // Join all fonts with a pipe character
  const fontString = formattedFonts.join('&family=');
  
  // Create the complete URL
  return `https://fonts.googleapis.com/css2?family=${fontString}&display=swap`;
}

/**
 * Load Google Fonts into the document
 * 
 * @param {FontFamily[]} fonts - Array of fonts to load
 * @param {string[]} weights - Font weights to load
 */
export function loadGoogleFonts(
  fonts: FontFamily[] = getGoogleFonts(),
  weights: string[] = ['300', '400', '500', '700']
): void {
  // Generate the Google Fonts URL
  const url = generateGoogleFontsUrl(fonts, weights);
  
  // Check if the link already exists
  const existingLink = document.querySelector(`link[href^="https://fonts.googleapis.com/css2"]`);
  if (existingLink) {
    // Update the existing link
    existingLink.setAttribute('href', url);
    return;
  }
  
  // Create a new link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  
  // Add preconnect links for better performance
  const preconnectGoogle = document.createElement('link');
  preconnectGoogle.rel = 'preconnect';
  preconnectGoogle.href = 'https://fonts.googleapis.com';
  
  const preconnectGstatic = document.createElement('link');
  preconnectGstatic.rel = 'preconnect';
  preconnectGstatic.href = 'https://fonts.gstatic.com';
  preconnectGstatic.setAttribute('crossorigin', '');
  
  // Add the links to the document head
  document.head.appendChild(preconnectGoogle);
  document.head.appendChild(preconnectGstatic);
  document.head.appendChild(link);
}

/**
 * Preload specific fonts for better performance
 * 
 * @param {string[]} fontNames - Names of fonts to preload
 * @param {string[]} weights - Font weights to preload
 */
export function preloadFonts(
  fontNames: string[] = ['Roboto', 'Open Sans'],
  weights: string[] = ['400', '700']
): void {
  // Find the fonts in our collection
  const fontsToLoad = ALL_FONTS.filter(font => 
    fontNames.includes(font.name) || fontNames.includes(font.value)
  );
  
  // Load the fonts
  loadGoogleFonts(fontsToLoad, weights);
}
