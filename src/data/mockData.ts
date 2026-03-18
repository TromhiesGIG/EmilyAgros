// src/data/mockData.ts
// Mock data removed - all data now comes from Supabase
// Keeping only utility functions used across the app

export const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString()}`;
};

// Keep getFeaturedCategories for any legacy usage
// but HomeScreen now uses CATEGORIES from categoryConfig directly
export const getFeaturedCategories = () => {
  // Import from categoryConfig instead
  const { CATEGORIES } = require('./categoryConfig');
  return CATEGORIES.slice(0, 8);
};