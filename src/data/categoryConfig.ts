import { Category, SubCategory } from '../navigation/types';
import { DropdownOption } from '../types/sellForm';

// All 15 categories with metadata
export const CATEGORIES: Category[] = [
  { 
    id: 1, 
    name: 'Trending', 
    slug: 'trending', 
    icon: require('../../assets/trending.png'), 
    subcategories: []
  },
  { 
    id: 2, 
    name: 'Livestock & Pets', 
    slug: 'livestock-pets', 
    icon: require('../../assets/livestock.png'), 
    subcategories: []
  },
  { 
    id: 3, 
    name: 'Services', 
    slug: 'services', 
    icon: require('../../assets/services.png'), 
    subcategories: []
  },
  { 
    id: 4, 
    name: 'Food, Fruits and Vegetables', 
    slug: 'food-fruits-vegetables', 
    icon: require('../../assets/fruit.png'), 
    subcategories: []
  },
  { 
    id: 5, 
    name: 'Animal Feed', 
    slug: 'animal-feed', 
    icon: require('../../assets/feed.png'), 
    subcategories: []
  },
  { 
    id: 6, 
    name: 'Tractors/Farm Equipments', 
    slug: 'tractors-farm-equipments', 
    icon: require('../../assets/tractors.png'), 
    subcategories: []
  },
  { 
    id: 7, 
    name: 'Fertilizers', 
    slug: 'fertilizers', 
    icon: require('../../assets/fertilizer.png'), 
    subcategories: []
  },
  { 
    id: 8, 
    name: 'Animal Accessories', 
    slug: 'animal-accessories', 
    icon: require('../../assets/accessories.png'), 
    subcategories: []
  },
  { 
    id: 9, 
    name: 'Seedlings', 
    slug: 'seedlings', 
    icon: require('../../assets/seed.png'), 
    subcategories: []
  },
  { 
    id: 10, 
    name: 'Animal Pharmacy', 
    slug: 'animal-pharmacy', 
    icon: require('../../assets/pharmacy.png'), 
    subcategories: []
  },
  { 
    id: 11, 
    name: 'Animal Mating', 
    slug: 'animal-mating', 
    icon: require('../../assets/Animal.png'), 
    subcategories: []
  },
  { 
    id: 12, 
    name: 'Agro Chemicals', 
    slug: 'agro-chemicals', 
    icon: require('../../assets/chemicals.png'), 
    subcategories: []
  },
  { 
    id: 13, 
    name: 'Horticulture', 
    slug: 'horticulture', 
    icon: require('../../assets/hort.png'), 
    subcategories: []
  },
  { 
  id: 14, 
  name: 'Agro Loan', 
  slug: 'agro-loan', 
  icon: require('../../assets/loan.png'), 
  subcategories: [],
  comingSoon: true, 
},
{ 
  id: 15, 
  name: 'Agro Insurance', 
  slug: 'agro-insurance', 
  icon: require('../../assets/insurance.png'), 
  subcategories: [],
  comingSoon: true, 
},
];

// Subcategories per category
export const SUBCATEGORIES: Record<number, SubCategory[]> = {
  2: [ // Livestock & Pets
    { id: 201, name: 'Dogs', slug: 'dogs' },
    { id: 202, name: 'Cats', slug: 'cats' },
    { id: 203, name: 'Cattle', slug: 'cattle' },
    { id: 204, name: 'Pigs', slug: 'pigs' },
    { id: 205, name: 'Rabbits', slug: 'rabbits' },
    { id: 206, name: 'Fish', slug: 'fish' },
    { id: 207, name: 'Goats', slug: 'goats' },
    { id: 208, name: 'Sheep', slug: 'sheep' },
    { id: 209, name: 'Birds/Poultry', slug: 'birds-poultry' },
    { id: 210, name: 'Snails', slug: 'snails' },
    { id: 211, name: 'Reptiles', slug: 'reptiles' },
    { id: 212, name: 'Others', slug: 'others' },
  ],
  3: [ // Services
    { id: 301, name: 'Farm Labor Supply', slug: 'farm-labor-supply' },
    { id: 302, name: 'Equipment Leasing', slug: 'equipment-leasing' },
    { id: 303, name: 'Veterinary Services', slug: 'veterinary-services' },
    { id: 304, name: 'Agricultural Consultancy', slug: 'agricultural-consultancy' },
  ],
  4: [ // Food, Fruits and Vegetables
    { id: 401, name: 'Fresh Fruits', slug: 'fresh-fruits' },
    { id: 402, name: 'Vegetables', slug: 'vegetables' },
    { id: 403, name: 'Berries', slug: 'berries' },
    { id: 404, name: 'Root plants', slug: 'root-plants' },
    { id: 405, name: 'Grains & Legumes', slug: 'grains-legumes' },
    { id: 406, name: 'Processed Foods', slug: 'processed-foods' },
    { id: 407, name: 'Herbs & Spices', slug: 'herbs-spices' },
  ],
  5: [ // Animal Feed
    { id: 501, name: 'Poultry', slug: 'poultry' },
    { id: 502, name: 'Cattle', slug: 'cattle' },
    { id: 503, name: 'Fish', slug: 'fish' },
    { id: 504, name: 'Goat and Sheep', slug: 'goat-sheep' },
    { id: 505, name: 'Pet', slug: 'pet' },
  ],
  7: [ // Fertilizers
    { id: 701, name: 'Organic', slug: 'organic' },
    { id: 702, name: 'Inorganic', slug: 'inorganic' },
    { id: 703, name: 'NPK', slug: 'npk' },
    { id: 704, name: 'Urea/Ammonium Sulfate', slug: 'urea-ammonium-sulfate' },
    { id: 705, name: 'Compost & Manure', slug: 'compost-manure' },
  ],
  8: [ // Animal Accessories
    { id: 801, name: 'Restraining (Collars & Leashes etc.)', slug: 'restraining' },
    { id: 802, name: 'Feeding Bowls', slug: 'feeding-bowls' },
    { id: 803, name: 'Cages & Crates', slug: 'cages-crates' },
    { id: 804, name: 'Grooming Tools', slug: 'grooming-tools' },
    { id: 805, name: 'Cleaning Items', slug: 'cleaning-items' },
    { id: 806, name: 'Housing Accessories', slug: 'housing-accessories' },
    { id: 807, name: 'Clothing & Identification', slug: 'clothing-identification' },
    { id: 808, name: 'Health Accessories', slug: 'health-accessories' },
  ],
  9: [ // Seedlings
    { id: 901, name: 'Fruit Seedlings', slug: 'fruit-seedlings' },
    { id: 902, name: 'Vegetable Seedlings', slug: 'vegetable-seedlings' },
    { id: 903, name: 'Tree Seedlings', slug: 'tree-seedlings' },
    { id: 904, name: 'Cash Crops', slug: 'cash-crops' },
  ],
  10: [ // Animal Pharmacy
    { id: 1001, name: 'Veterinary Drugs', slug: 'veterinary-drugs' },
    { id: 1002, name: 'Vitamins & Supplements', slug: 'vitamins-supplements' },
    { id: 1003, name: 'Dewormers', slug: 'dewormers' },
    { id: 1004, name: 'Vaccines', slug: 'vaccines' },
    { id: 1005, name: 'First Aid', slug: 'first-aid' },
    { id: 1006, name: 'Antibiotics', slug: 'antibiotics' },
  ],
  11: [ // Animal Mating
    { id: 1101, name: 'Stud Services (Dogs, Cats, Cattles, Rams, Horses etc.)', slug: 'stud-services' },
    { id: 1102, name: 'Breeding', slug: 'breeding' },
    { id: 1103, name: 'Artificial Insemination', slug: 'artificial-insemination' },
  ],
  13: [ // Horticulture
    { id: 1301, name: 'Greenhouse Structures', slug: 'greenhouse-structures' },
    { id: 1302, name: 'Greenhouse Equipment', slug: 'greenhouse-equipment' },
    { id: 1303, name: 'Greenhouse Materials', slug: 'greenhouse-materials' },
    { id: 1304, name: 'Greenhouse Crops', slug: 'greenhouse-crops' },
    { id: 1305, name: 'Greenhouse Services', slug: 'greenhouse-services' },
    { id: 1306, name: 'Greenhouse Accessories', slug: 'greenhouse-accessories' },
  ],
};

// Populate subcategories into categories
CATEGORIES.forEach(category => {
  if (SUBCATEGORIES[category.id]) {
    category.subcategories = SUBCATEGORIES[category.id];
  }
});

// Dropdown options for various fields
export const DROPDOWN_OPTIONS = {
  breedRegistration: [
    { label: 'Purebred', value: 'purebred' },
    { label: 'Crossbred', value: 'crossbred' },
    { label: 'Registered', value: 'registered' },
  ] as DropdownOption[],
  
  seedTypeVariety: [
    { label: 'Hybrid F1', value: 'hybrid_f1' },
    { label: 'Local', value: 'local' },
    { label: 'Improved Variety', value: 'improved_variety' },
  ] as DropdownOption[],
  
  climateType: [
    { label: 'Tropical', value: 'tropical' },
    { label: 'Semi-Arid', value: 'semi_arid' },
    { label: 'Humid', value: 'humid' },
    { label: 'Temperate Variety', value: 'temperate' },
  ] as DropdownOption[],
  
  fertilizerFormulation: [
    { label: 'Tablet', value: 'tablet' },
    { label: 'Injection', value: 'injection' },
    { label: 'Powder', value: 'powder' },
    { label: 'Syrup', value: 'syrup' },
    { label: 'Paste', value: 'paste' },
    { label: 'Spray', value: 'spray' },
  ] as DropdownOption[],
  
  fertilizerPackaging: [
    { label: 'Bottle', value: 'bottle' },
    { label: 'Sachet', value: 'sachet' },
    { label: 'Box', value: 'box' },
    { label: 'Tube', value: 'tube' },
    { label: 'Blister', value: 'blister' },
    { label: 'Can', value: 'can' },
  ] as DropdownOption[],
  
  fuelType: [
    { label: 'Diesel', value: 'diesel' },
    { label: 'Petrol', value: 'petrol' },
    { label: 'Electric', value: 'electric' },
  ] as DropdownOption[],
  
  transmissionType: [
    { label: 'Manual', value: 'manual' },
    { label: 'Automatic', value: 'automatic' },
  ] as DropdownOption[],
  
  functionalityStatus: [
    { label: 'Fully Functional', value: 'fully_functional' },
    { label: 'Needs Repair', value: 'needs_repair' },
  ] as DropdownOption[],
  
  equipmentCondition: [
    { label: 'New', value: 'new' },
    { label: 'Used', value: 'used' },
    { label: 'Fairly Used', value: 'fairly_used' },
  ] as DropdownOption[],
  
  fertilizerCondition: [
    { label: 'New', value: 'new' },
    { label: 'Used', value: 'used' },
    { label: 'Fairly Used', value: 'fairly_used' },
    { label: 'Compound', value: 'compound' },
    { label: 'Biofertilizer', value: 'biofertilizer' },
  ] as DropdownOption[],
  
  fertilizerForm: [
    { label: 'Granular', value: 'granular' },
    { label: 'Powder', value: 'powder' },
    { label: 'Liquid', value: 'liquid' },
    { label: 'Pellet', value: 'pellet' },
    { label: 'Crystal', value: 'crystal' },
  ] as DropdownOption[],
  
  feedType: [
    { label: 'Grains', value: 'grains' },
    { label: 'Hay', value: 'hay' },
    { label: 'Pellets', value: 'pellets' },
    { label: 'Meal', value: 'meal' },
    { label: 'Concentrates', value: 'concentrates' },
  ] as DropdownOption[],
  
  feedStage: [
    { label: 'Starter', value: 'starter' },
    { label: 'Grower', value: 'grower' },
    { label: 'Finisher', value: 'finisher' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'All-Stage', value: 'all_stage' },
  ] as DropdownOption[],
  
  yearsOfExperience: [
    { label: '1-2 yrs', value: '1-2' },
    { label: '3-5 yrs', value: '3-5' },
    { label: '5+ yrs', value: '5+' },
  ] as DropdownOption[],
  
  animalType: [
    { label: 'Dog', value: 'dog' },
    { label: 'Cat', value: 'cat' },
    { label: 'Poultry', value: 'poultry' },
    { label: 'Goat', value: 'goat' },
    { label: 'Sheep', value: 'sheep' },
    { label: 'Cattle', value: 'cattle' },
    { label: 'Pigs', value: 'pigs' },
    { label: 'Rabbit', value: 'rabbit' },
    { label: 'Horse', value: 'horse' },
    { label: 'Fish', value: 'fish' },
    { label: 'Other', value: 'other' },
  ] as DropdownOption[],

  cropType: [
    { label: 'Vegetables', value: 'vegetables' },
    { label: 'Fruits', value: 'fruits' },
    { label: 'Grains', value: 'grains' },
    { label: 'Root Crops', value: 'root_crops' },
    { label: 'Cash Crops', value: 'cash_crops' },
  ] as DropdownOption[],

  serviceType: [
    { label: 'Farm Labor', value: 'farm_labor' },
    { label: 'Equipment Rental', value: 'equipment_rental' },
    { label: 'Veterinary Care', value: 'veterinary_care' },
    { label: 'Agricultural Consulting', value: 'agricultural_consulting' },
    { label: 'Irrigation Services', value: 'irrigation_services' },
  ] as DropdownOption[],

  pricingBasis: [
    { label: 'Per Hour', value: 'per_hour' },
    { label: 'Per Day', value: 'per_day' },
    { label: 'Per Week', value: 'per_week' },
    { label: 'Per Project', value: 'per_project' },
    { label: 'Per Visit', value: 'per_visit' },
  ] as DropdownOption[],
};

export const LIVESTOCK_BREEDS: Record<string, DropdownOption[]> = {
  dogs: [
    { label: 'Rottweiler', value: 'rottweiler' },
    { label: 'German Shepherd', value: 'german_shepherd' },
    { label: 'Bulldog', value: 'bulldog' },
    { label: 'Boerboel', value: 'boerboel' },
    { label: 'Lhasa Apso', value: 'lhasa_apso' },
  ],
  cats: [
    { label: 'Persian', value: 'persian' },
    { label: 'Siamese', value: 'siamese' },
    { label: 'Local', value: 'local' },
  ],
  cattle: [
    { label: 'Brahman', value: 'brahman' },
    { label: 'Angus', value: 'angus' },
    { label: 'White Fulani', value: 'white_fulani' },
    { label: 'Red Bororo', value: 'red_bororo' },
  ],
  pigs: [
    { label: 'Large White', value: 'large_white' },
    { label: 'Duroc', value: 'duroc' },
    { label: 'Landrace', value: 'landrace' },
  ],
  goats: [
    { label: 'Boer', value: 'boer' },
    { label: 'West African Dwarf', value: 'west_african_dwarf' },
    { label: 'Kalahari Red', value: 'kalahari_red' },
  ],
  sheep: [
    { label: 'West African Dwarf', value: 'west_african_dwarf' },
    { label: 'Balami', value: 'balami' },
    { label: 'Uda', value: 'uda' },
  ],
  'birds-poultry': [
    { label: 'Broiler', value: 'broiler' },
    { label: 'Layer', value: 'layer' },
    { label: 'Cockerel', value: 'cockerel' },
    { label: 'Turkey', value: 'turkey' },
    { label: 'Ostrich', value: 'ostrich' },
  ],
};

// Helper function to get subcategories by category ID
export const getSubcategoriesByCategory = (categoryId: number): SubCategory[] => {
  return SUBCATEGORIES[categoryId] || [];
};

// Helper function to get category by slug
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.slug === slug);
};

// Helper function to get category by ID
export const getCategoryById = (id: number): Category | undefined => {
  return CATEGORIES.find(cat => cat.id === id);
};