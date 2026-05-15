// src/types/attributes.ts
// Product Attributes System Types

export interface ProductAttribute {
  id: string;
  product_id: string;
  attribute_name: string;
  attribute_value: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttributeDefinition {
  id: string;
  category_id: number;
  attribute_name: string;
  attribute_label: string;
  attribute_type: 'text' | 'number' | 'select' | 'range' | 'boolean';
  is_required: boolean;
  display_order: number;
  placeholder?: string;
  created_at?: string;
}

export interface AttributeOption {
  value: string;
  label: string;
}

// Combined type for filter UI
export interface FilterAttribute extends Omit<AttributeDefinition, 'created_at'> {
  options?: AttributeOption[];
  created_at?: string;
}

// Active filters state
export interface ActiveFilters {
  [key: string]: string | string[] | number | boolean;
}

// Filter state for CategoryProductsScreen
export interface ProductFilters {
  search?: string;
  category_id?: number;
  subcategory_id?: number;
  min_price?: number;
  max_price?: number;
  location?: string;
  condition?: 'new' | 'used';
  sort_by?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular';
  attributes?: ActiveFilters;
}

// Filter option for UI
export interface FilterOption {
  label: string;
  value: string | number;
  count?: number; // Number of products with this filter
}

// Sort options
export const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Price: Low to High', value: 'price_low' },
  { label: 'Price: High to Low', value: 'price_high' },
  { label: 'Most Popular', value: 'popular' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['value'];