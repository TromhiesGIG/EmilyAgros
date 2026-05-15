// src/services/attributesService.ts - REWRITTEN TO USE EXISTING DETAIL TABLES
import { supabase } from './supabase';
import {
  FilterAttribute,
  ProductFilters,
  SortOption,
} from '../types/attributes';

/**
 * Map category_id to detail table name
 */
const CATEGORY_DETAIL_TABLES: Record<number, string> = {
  2: 'livestock_details',              // Livestock & Pets
  3: 'service_details',                // Services
  4: 'produce_details',                // Food, Fruits and Vegetables
  5: 'animal_feed_details',            // Animal Feed
  6: 'equipment_details',              // Tractors/Farm Equipments
  7: 'fertilizer_details',             // Fertilizers
  8: 'animal_accessories_details',     // Animal Accessories
  9: 'seedling_details',               // Seedlings
  10: 'animal_pharmacy_details',       // Animal Pharmacy
  11: 'animal_mating_details',         // Animal Mating
  12: 'agro_chemicals_details',        // Agro Chemicals
  13: 'horticulture_details',          // Horticulture
};

/**
 * Define filters for each category based on their detail table columns
 */
const CATEGORY_FILTERS: Record<number, FilterAttribute[]> = {
  // Livestock & Pets
  2: [
    {
      id: 'breed',
      category_id: 2,
      attribute_name: 'breed',
      attribute_label: 'Breed',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'gender',
      category_id: 2,
      attribute_name: 'gender',
      attribute_label: 'Gender',
      attribute_type: 'select',
      is_required: false,
      display_order: 2,
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
      ],
    },
    {
      id: 'age',
      category_id: 2,
      attribute_name: 'age',
      attribute_label: 'Age',
      attribute_type: 'text',
      is_required: false,
      display_order: 3,
    },
    {
      id: 'size',
      category_id: 2,
      attribute_name: 'size',
      attribute_label: 'Size',
      attribute_type: 'select',
      is_required: false,
      display_order: 4,
      options: [
        { value: 'Small', label: 'Small' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Large', label: 'Large' },
      ],
    },
    {
      id: 'registered',
      category_id: 2,
      attribute_name: 'registered',
      attribute_label: 'Registered',
      attribute_type: 'boolean',
      is_required: false,
      display_order: 5,
    },
  ],

  // Services
  3: [
    {
      id: 'service_type',
      category_id: 3,
      attribute_name: 'service_type',
      attribute_label: 'Service Type',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'years_of_experience',
      category_id: 3,
      attribute_name: 'years_of_experience',
      attribute_label: 'Years of Experience',
      attribute_type: 'text',
      is_required: false,
      display_order: 2,
    },
    {
      id: 'mode_of_delivery',
      category_id: 3,
      attribute_name: 'mode_of_delivery',
      attribute_label: 'Mode of Delivery',
      attribute_type: 'text',
      is_required: false,
      display_order: 3,
    },
  ],

  // Food, Fruits and Vegetables
  4: [
    {
      id: 'type',
      category_id: 4,
      attribute_name: 'type',
      attribute_label: 'Type',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'perishability',
      category_id: 4,
      attribute_name: 'perishability',
      attribute_label: 'Perishability',
      attribute_type: 'select',
      is_required: false,
      display_order: 2,
      options: [
        { value: 'Highly Perishable', label: 'Highly Perishable' },
        { value: 'Moderately Perishable', label: 'Moderately Perishable' },
        { value: 'Non-Perishable', label: 'Non-Perishable' },
      ],
    },
    {
      id: 'quantity_available',
      category_id: 4,
      attribute_name: 'quantity_available',
      attribute_label: 'Quantity',
      attribute_type: 'text',
      is_required: false,
      display_order: 3,
    },
  ],

  // Animal Feed
  5: [
    {
      id: 'feed_type',
      category_id: 5,
      attribute_name: 'feed_type',
      attribute_label: 'Feed Type',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'feed_name',
      category_id: 5,
      attribute_name: 'feed_name',
      attribute_label: 'Feed Name',
      attribute_type: 'text',
      is_required: false,
      display_order: 2,
    },
    {
      id: 'purpose_stage',
      category_id: 5,
      attribute_name: 'purpose_stage',
      attribute_label: 'Purpose/Stage',
      attribute_type: 'text',
      is_required: false,
      display_order: 3,
    },
  ],

  // Tractors/Farm Equipment
  6: [
    {
      id: 'brand_manufacturer',
      category_id: 6,
      attribute_name: 'brand_manufacturer',
      attribute_label: 'Brand',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'condition',
      category_id: 6,
      attribute_name: 'condition',
      attribute_label: 'Condition',
      attribute_type: 'select',
      is_required: false,
      display_order: 2,
      options: [
        { value: 'New', label: 'New' },
        { value: 'Used', label: 'Used' },
        { value: 'Refurbished', label: 'Refurbished' },
      ],
    },
    {
      id: 'year_of_manufacture',
      category_id: 6,
      attribute_name: 'year_of_manufacture',
      attribute_label: 'Year',
      attribute_type: 'text',
      is_required: false,
      display_order: 3,
    },
    {
      id: 'fuel_type',
      category_id: 6,
      attribute_name: 'fuel_type',
      attribute_label: 'Fuel Type',
      attribute_type: 'select',
      is_required: false,
      display_order: 4,
      options: [
        { value: 'Diesel', label: 'Diesel' },
        { value: 'Petrol', label: 'Petrol' },
        { value: 'Electric', label: 'Electric' },
        { value: 'Hybrid', label: 'Hybrid' },
      ],
    },
  ],

  // Fertilizers
  7: [
    {
      id: 'fertilizer_type',
      category_id: 7,
      attribute_name: 'fertilizer_type',
      attribute_label: 'Fertilizer Type',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'brand_manufacturer',
      category_id: 7,
      attribute_name: 'brand_manufacturer',
      attribute_label: 'Brand',
      attribute_type: 'text',
      is_required: false,
      display_order: 2,
    },
    {
      id: 'formulation_state',
      category_id: 7,
      attribute_name: 'formulation_state',
      attribute_label: 'Formulation',
      attribute_type: 'select',
      is_required: false,
      display_order: 3,
      options: [
        { value: 'Liquid', label: 'Liquid' },
        { value: 'Granular', label: 'Granular' },
        { value: 'Powder', label: 'Powder' },
      ],
    },
  ],

  // Animal Accessories
  8: [
    {
      id: 'suitable_animal_type',
      category_id: 8,
      attribute_name: 'suitable_animal_type',
      attribute_label: 'Animal Type',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'material_type',
      category_id: 8,
      attribute_name: 'material_type',
      attribute_label: 'Material',
      attribute_type: 'text',
      is_required: false,
      display_order: 2,
    },
    {
      id: 'brand_manufacturer',
      category_id: 8,
      attribute_name: 'brand_manufacturer',
      attribute_label: 'Brand',
      attribute_type: 'text',
      is_required: false,
      display_order: 3,
    },
  ],

  // Seedlings
  9: [
    {
      id: 'type_variety',
      category_id: 9,
      attribute_name: 'type_variety',
      attribute_label: 'Type/Variety',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'seedling_age',
      category_id: 9,
      attribute_name: 'seedling_age',
      attribute_label: 'Seedling Age',
      attribute_type: 'text',
      is_required: false,
      display_order: 2,
    },
    {
      id: 'suitable_climate',
      category_id: 9,
      attribute_name: 'suitable_climate',
      attribute_label: 'Climate',
      attribute_type: 'text',
      is_required: false,
      display_order: 3,
    },
  ],

  // Animal Pharmacy
  10: [
    {
      id: 'animal_type',
      category_id: 10,
      attribute_name: 'animal_type',
      attribute_label: 'Animal Type',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'form_type',
      category_id: 10,
      attribute_name: 'form_type',
      attribute_label: 'Form Type',
      attribute_type: 'select',
      is_required: false,
      display_order: 2,
      options: [
        { value: 'Tablet', label: 'Tablet' },
        { value: 'Liquid', label: 'Liquid' },
        { value: 'Injection', label: 'Injection' },
        { value: 'Powder', label: 'Powder' },
      ],
    },
  ],

  // Animal Mating
  11: [
    {
      id: 'breed',
      category_id: 11,
      attribute_name: 'breed',
      attribute_label: 'Breed',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'gender',
      category_id: 11,
      attribute_name: 'gender',
      attribute_label: 'Gender',
      attribute_type: 'select',
      is_required: false,
      display_order: 2,
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
      ],
    },
    {
      id: 'age',
      category_id: 11,
      attribute_name: 'age',
      attribute_label: 'Age',
      attribute_type: 'text',
      is_required: false,
      display_order: 3,
    },
    {
      id: 'fertility_tested',
      category_id: 11,
      attribute_name: 'fertility_tested',
      attribute_label: 'Fertility Tested',
      attribute_type: 'boolean',
      is_required: false,
      display_order: 4,
    },
  ],

  // Agro Chemicals
  12: [
    {
      id: 'active_ingredient',
      category_id: 12,
      attribute_name: 'active_ingredient',
      attribute_label: 'Active Ingredient',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'brand_manufacturer',
      category_id: 12,
      attribute_name: 'brand_manufacturer',
      attribute_label: 'Brand',
      attribute_type: 'text',
      is_required: false,
      display_order: 2,
    },
    {
      id: 'formulation_type',
      category_id: 12,
      attribute_name: 'formulation_type',
      attribute_label: 'Formulation',
      attribute_type: 'text',
      is_required: false,
      display_order: 3,
    },
  ],

  // Horticulture
  13: [
    {
      id: 'variety_type',
      category_id: 13,
      attribute_name: 'variety_type',
      attribute_label: 'Variety',
      attribute_type: 'text',
      is_required: false,
      display_order: 1,
    },
    {
      id: 'plant_size_age',
      category_id: 13,
      attribute_name: 'plant_size_age',
      attribute_label: 'Plant Size/Age',
      attribute_type: 'text',
      is_required: false,
      display_order: 2,
    },
    {
      id: 'light_requirement',
      category_id: 13,
      attribute_name: 'light_requirement',
      attribute_label: 'Light Requirement',
      attribute_type: 'select',
      is_required: false,
      display_order: 3,
      options: [
        { value: 'Full Sun', label: 'Full Sun' },
        { value: 'Partial Shade', label: 'Partial Shade' },
        { value: 'Full Shade', label: 'Full Shade' },
      ],
    },
  ],
};

class AttributesService {
  /**
   * Get filter definitions for a category
   */
  async getAttributeDefinitionsForCategory(categoryId: number): Promise<FilterAttribute[]> {
    return CATEGORY_FILTERS[categoryId] || [];
  }

  /**
   * Search and filter products with details from category-specific tables
   */
  async searchProducts(filters: ProductFilters) {
    let query = supabase
      .from('products')
      .select('*');

    // Category filter
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    // Subcategory filter
    if (filters.subcategory_id) {
      query = query.eq('subcategory_id', filters.subcategory_id);
    }

    // Price range filter
    if (filters.min_price !== undefined) {
      query = query.gte('price', filters.min_price);
    }
    if (filters.max_price !== undefined) {
      query = query.lte('price', filters.max_price);
    }

    // Location filter
    if (filters.location) {
      query = query.ilike('location_state', `%${filters.location}%`);
    }

    // Search filter (title or description)
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // Sort
    switch (filters.sort_by) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'price_low':
        query = query.order('price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false });
        break;
      case 'popular':
        query = query.order('views', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    if (!products || products.length === 0) {
      return [];
    }

    // Fetch related data
    const productIds = products.map(p => p.id);
    const userIds = [...new Set(products.map(p => p.user_id))];

    // Fetch images
    const { data: images } = await supabase
      .from('product_images')
      .select('product_id, image_url')
      .in('product_id', productIds);

    // Fetch profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, full_name, avatar_url')
      .in('id', userIds);

    // Fetch category-specific details if filters are applied
    let detailsData: any[] = [];
    if (filters.category_id && CATEGORY_DETAIL_TABLES[filters.category_id]) {
      const tableName = CATEGORY_DETAIL_TABLES[filters.category_id];
      
      const { data } = await supabase
        .from(tableName)
        .select('*')
        .in('product_id', productIds);
      
      detailsData = data || [];
    }

    // Combine everything
    let productsWithRelations = products.map(product => {
      const productImages = images?.filter(img => img.product_id === product.id) || [];
      const productProfile = profiles?.find(p => p.id === product.user_id) || null;
      const productDetails = detailsData.find(d => d.product_id === product.id) || null;

      return {
        ...product,
        product_images: productImages,
        profiles: productProfile,
        details: productDetails,
      };
    });

    // Client-side filter by category-specific attributes
    if (filters.attributes && Object.keys(filters.attributes).length > 0) {
      productsWithRelations = productsWithRelations.filter((product) => {
        if (!product.details) return false;

        return Object.entries(filters.attributes!).every(([attrName, attrValue]) => {
          const detailValue = product.details[attrName];

          if (detailValue === null || detailValue === undefined) return false;

          // Handle boolean filters
          if (typeof attrValue === 'boolean') {
            return detailValue === attrValue;
          }

          // Handle array values (multi-select)
          if (Array.isArray(attrValue)) {
            return attrValue.includes(String(detailValue));
          }

          // Handle single value (case-insensitive)
          return String(detailValue).toLowerCase().includes(String(attrValue).toLowerCase());
        });
      });
    }

    return productsWithRelations;
  }

  /**
   * Get unique values for a specific attribute (for dynamic filter options)
   */
  async getUniqueAttributeValues(
    categoryId: number,
    attributeName: string
  ): Promise<string[]> {
    const tableName = CATEGORY_DETAIL_TABLES[categoryId];
    if (!tableName) return [];

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(attributeName);

      if (error) throw error;

      const uniqueValues = [...new Set(
        data
          ?.map((item: any) => item[attributeName])
          .filter((val: any) => val !== null && val !== undefined && val !== '')
      )] as string[];

      return uniqueValues;
    } catch (error) {
      console.error('Error fetching unique values:', error);
      return [];
    }
  }
}

export const attributesService = new AttributesService();