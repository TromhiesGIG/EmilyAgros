// src/types/sellForm.ts
export interface SellFormData {
  // Common fields (all categories)
  productTitle: string;
  categoryId: number | null;
  categoryName: string;
  subcategoryId: number | null;
  subcategoryName: string;
  description: string;
  images: string[]; // Base64 or URLs
  price: string;
  negotiable: boolean;
  
  // Location
  location: {
    state: string;
    lga: string;
    address: string;
  };
  
  // Contact
  contact: {
    name: string;
    businessName: string;
    phone: string;
    availableOnWhatsapp: boolean;
  };
  
  // Category-specific fields
  equipment?: EquipmentFields;
  livestock?: LivestockFields;
  seedling?: SeedlingFields;
  service?: ServiceFields;
  produce?: ProduceFields;
  horticulture?: HorticultureFields;
  fertilizer?: FertilizerFields;
  animalFeed?: AnimalFeedFields;
  animalPharmacy?: AnimalPharmacyFields;
  animalMating?: AnimalMatingFields;
  animalAccessories?: AnimalAccessoriesFields;
  agroChemicals?: AgroChemicalsFields;
}

// Equipment (Tractors/Farm Equipment)
export interface EquipmentFields {
  quantityAvailable?: string;
  brandManufacturer?: string;
  condition?: string;
  power?: string;
  fuelType?: string;
  transmissionType?: string;
  yearOfManufacture?: string;
  hoursOfUse?: string;
  functionalityStatus?: string;
  availability?: 'for_sale' | 'for_rent';
  rentalRate?: string;
}

// Livestock & Pets
export interface LivestockFields {
  breed: string;
  gender: 'male' | 'female';
  age: string;
  dateOfBirth: string;
  color: string;
  size: string;
  registered: boolean;
  healthCondition: {
    vaccinated: boolean;
    dewormed: boolean;
    spayedNeutered: boolean;
  };
  healthNotes: string;
  featuresTraits: {
    temperament: string;
    specialTraits: string;
    trainingLevel: string;
  };
  availableFrom: string;
  deliveryAvailable: boolean;
}

// Seedlings
export interface SeedlingFields {
  typeVariety?: string;
  seedlingAge?: string;
  recommendedSoilType?: string;
  suitableClimate?: string;
  plantingSeason?: string;
  expectedYieldGrowthTime?: string;
  quantityAvailable?: string;
  climateType?: string;
  cropType?: string;
  packQuantity?: string;
}

// Services
export interface ServiceFields {
  serviceType?: string;
  yearsOfExperience?: string;
  modeOfDelivery?: 'onsite' | 'remote' | 'customer';
  serviceFee?: string;
  pricingBasis?: string;
  availabilitySchedule?: string;
  serviceCoverageArea?: string;
  durationEstimate?: string;
  specialization?: string;
  toolsEquipmentProvided?: string;
  requiredInputs?: string;
  supportingDocuments?: string; // File path
}

// Produce (Food, Fruits & Vegetables)
export interface ProduceFields {
  perishability: 'perishable' | 'non_perishable';
  harvestExpiryDate: string;
  type: 'organic' | 'inorganic';
  quantityAvailable: string;
}

// Horticulture
export interface HorticultureFields {
  botanicalName: string;
  varietyType: string;
  plantSizeAge: string;
  soilRequirement: string;
  lightRequirement: string;
  wateringFrequency: string;
  seasonOfBloomGrowth: string;
  fertilizerRecommendation: string;
  quantityAvailable: string;
}

// Fertilizers
export interface FertilizerFields {
  fertilizerType?: string;
  brandManufacturer?: string;
  formulationState?: string;
  applicationMethod?: string;
  quantityAvailable?: string;
  packSizeWeight?: string;
  minimumOrder?: string;
}

// Animal Feed
export interface AnimalFeedFields {
  feedType?: string;
  ingredients?: string;
  feedName?: string;
  purposeStage?: string;
  packagingSize?: string;
  quantityAvailable?: string;
}

// Animal Pharmacy
export interface AnimalPharmacyFields {
  animalType?: string;
  formType?: string;
  activeIngredients?: string;
  dosageInstructions?: string;
  indications?: string;
  contraindications?: string;
  withdrawalPeriod?: string;
  packSize?: string;
  packageType?: string;
  batchNumber?: string;
  expiryDate?: string;
  nafdacNo?: string;
  quantityAvailable?: string;
  minimumOrderQuantity?: string;
}

// Animal Mating (Breeding/Stud Services)
export interface AnimalMatingFields {
  breed?: string;
  gender?: 'male' | 'female';
  age?: string;
  pedigreeStatus?: string;
  specialTraits?: string;
  breedingHistory?: 'proven' | 'first_time' | 'unknown';
  fertilityTested?: boolean;
  vaccinationStatus?: boolean;
  availableFor?: string;
}

// Animal Accessories
export interface AnimalAccessoriesFields {
  suitableAnimalType: string;
  materialType: string;
  brandManufacturer: string;
  sizeDimension: string;
  quantityAvailable: string;
}

// Agro Chemicals
export interface AgroChemicalsFields {
  activeIngredient: string;
  brandManufacturer: string;
  applicationMethod: string;
  formulationType: string;
  toxicityLevel: string;
  quantityAvailable: string;
  packSize: string;
}

// Dropdown option type
export interface DropdownOption {
  label: string;
  value: string;
}