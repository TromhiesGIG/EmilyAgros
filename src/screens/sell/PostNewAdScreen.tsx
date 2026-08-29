// src/screens/sell/PostNewAdScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SellStackParamList, Category, SubCategory } from '../../navigation/types';
import { SellFormData } from '../../types/sellForm';
import {
  getSubcategoriesByCategory,
  getCategoryById,
} from '../../data/categoryConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

// Import all components
import { CommonFields } from './fields/CommonFields';
import { PricingFields } from './fields/PricingFields';
import { LocationFields } from './fields/LocationFields';
import { ContactFields } from './fields/ContactFields';
import { EquipmentFields } from './fields/EquipmentFields';
import { LivestockFields } from './fields/LivestockFields';
import { SeedlingFields } from './fields/SeedlingFields';
import { ServiceFields } from './fields/ServiceFields';
import { ProduceFields } from './fields/ProduceFields';
import { HorticultureFields } from './fields/HorticultureFields';
import { FertilizerFields } from './fields/FertilizerFields';
import { AnimalFeedFields } from './fields/AnimalFeedFields';
import { AnimalPharmacyFields } from './fields/AnimalPharmacyFields';
import { AnimalMatingFields } from './fields/AnimalMatingFields';
import { AnimalAccessoriesFields } from './fields/AnimalAccessoriesFields';
import { AgroChemicalsFields } from './fields/AgroChemicalsFields';
import { PreviewModal } from '../../components/forms/PreviewModal'; 

// Import Supabase & Auth
import { supabase } from '../../services/supabase';
import { authService } from '../../services/auth';

type PostNewAdScreenNavigationProp = StackNavigationProp<SellStackParamList, 'PostNewAd'>;
type PostNewAdScreenRouteProp = RouteProp<SellStackParamList, 'PostNewAd'>;

interface PostNewAdScreenProps {
  navigation: PostNewAdScreenNavigationProp;
  route: PostNewAdScreenRouteProp;
}

const DRAFT_KEY = 'listing_draft';

const getInitialFormData = (): SellFormData => ({
  productTitle: '',
  categoryId: null,
  categoryName: '',
  subcategoryId: null,
  subcategoryName: '',
  description: '',
  images: [],
  price: '',
  negotiable: false,
  location: { state: '', lga: '', address: '' },
  contact: { name: '', businessName: '', phone: '', availableOnWhatsapp: false },
});

const validateForm = (
  data: SellFormData,
  categorySlug: string | null
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!data.productTitle || data.productTitle.length < 5 || data.productTitle.length > 100) {
    errors.push('Product title must be between 5 and 100 characters.');
  }
  if (!data.categoryId) {
    errors.push('Please select a category.');
  }
  if (!data.description || data.description.length < 20 || data.description.length > 300) {
    errors.push('Description must be between 20 and 300 characters.');
  }
  if (!data.images || data.images.length === 0) {
    errors.push('Please upload at least one image.');
  }
  if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) {
    errors.push('Please enter a valid price greater than 0.');
  }
  if (!data.location.state) {
    errors.push('Please select a state.');
  }
  if (!data.location.lga) {
    errors.push('Please select an LGA.');
  }
  const phoneRegex = /^0[789][01]\d{8}$/;
  if (!data.contact.phone || !phoneRegex.test(data.contact.phone)) {
    errors.push('Please enter a valid 11-digit Nigerian phone number (e.g., 080...).');
  }
  
  if (categorySlug) {
    switch (categorySlug) {
      case 'tractors-farm-equipments': 
        if (!data.equipment?.quantityAvailable) errors.push('Please enter quantity available.'); 
        break;
      case 'livestock-pets': 
        if (!data.livestock?.breed) errors.push('Please select a breed.'); 
        break;
      case 'seedlings-seeds': 
        if (!data.seedling?.quantityAvailable) errors.push('Please enter quantity available.'); 
        break;
      case 'farm-produce': 
        if (!data.produce?.quantityAvailable) errors.push('Please enter quantity available.'); 
        break;
      case 'fertilizers': 
        if (!data.fertilizer?.quantityAvailable) errors.push('Please enter quantity available.'); 
        break;
      case 'agro-chemicals': 
        if (!data.agroChemicals?.quantityAvailable) errors.push('Please enter quantity available.'); 
        break;
      case 'animal-feed': 
        if (!data.animalFeed?.quantityAvailable) errors.push('Please enter quantity available.'); 
        break;
      case 'animal-pharmacy': 
        if (!data.animalPharmacy?.quantityAvailable) errors.push('Please enter quantity available.'); 
        break;
      case 'animal-accessories': 
        if (!data.animalAccessories?.quantityAvailable) errors.push('Please enter quantity available.'); 
        break;
      case 'horticulture-gardening': 
        if (!data.horticulture?.quantityAvailable) errors.push('Please enter quantity available.'); 
        break;
      case 'services': 
        if (!data.service?.serviceFee) errors.push('Please enter a service fee.'); 
        break;
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

const uploadImagesToCloud = async (localUris: string[], userId: string): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  const BUCKET_NAME = 'product-images';
  
  for (const uri of localUris) {
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';
      
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      
      const decode = (str: string) => {
        const binaryString = atob(str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      };
      
      const arrayBuffer = decode(base64);
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, arrayBuffer, { contentType: contentType, upsert: false });
      
      if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);
      
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      
      if (!data.publicUrl) throw new Error('Failed to get public URL for image.');
      
      uploadedUrls.push(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
  
  return uploadedUrls;
};

const submitListingToSupabase = async (
  formData: SellFormData, 
  categorySlug: string, 
  userId: string
) => {
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert({
      user_id: userId, // ← Changed from seller_id
      title: formData.productTitle,
      description: formData.description,
      category_id: formData.categoryId,
      subcategory_id: formData.subcategoryId,
      price: parseFloat(formData.price),
      negotiable: formData.negotiable,
      images: formData.images, 
      status: 'Active',
      location_state: formData.location.state, // ← Changed
      location_lga: formData.location.lga, // ← Changed
      location_address: formData.location.address, // ← Changed
      contact_name: formData.contact.name,
      contact_business: formData.contact.businessName, // ← Changed
      contact_phone: formData.contact.phone,
      contact_whatsapp: formData.contact.availableOnWhatsapp,
    })
    .select()
    .single();
  
  if (productError) throw new Error(`Failed to create product: ${productError.message}`);
  if (!productData) throw new Error('Failed to create product, no data returned.');
  
  const productId = productData.id;
  let categoryError: any = null;
  let tableToInsert: string | null = null;
  let dataToInsert: any = null;
  
  switch (categorySlug) {
    case 'tractors-farm-equipments':
      if (formData.equipment) {
        tableToInsert = 'equipment_details';
        const d = formData.equipment;
        dataToInsert = { 
          product_id: productId, 
          quantity_available: d.quantityAvailable, 
          brand_manufacturer: d.brandManufacturer, 
          condition: d.condition, 
          power: d.power, 
          fuel_type: d.fuelType, 
          transmission_type: d.transmissionType, 
          year_of_manufacture: d.yearOfManufacture, 
          hours_of_use: d.hoursOfUse, 
          functionality_status: d.functionalityStatus, 
          availability: d.availability, 
          rental_rate: d.rentalRate 
        };
      }
      break;
      
    case 'livestock-pets':
      if (formData.livestock) {
        tableToInsert = 'livestock_details';
        const d = formData.livestock;
        dataToInsert = { 
          product_id : productId,
          breed: d.breed, 
          gender: d.gender, 
          age: d.age, 
          date_of_birth: d.dateOfBirth || null, 
          color: d.color, 
          size: d.size, 
          registered: d.registered, 
          health_condition: d.healthCondition, 
          health_notes: d.healthNotes, 
          features_traits: d.featuresTraits, 
          available_from: d.availableFrom, 
          delivery_available: d.deliveryAvailable 
        };
      }
      break;
      
    case 'seedlings-seeds':
      if (formData.seedling) {
        tableToInsert = 'seedling_details';
        const d = formData.seedling;
        dataToInsert = { 
          product_id: productId, 
          type_variety: d.typeVariety, 
          seedling_age: d.seedlingAge, 
          recommended_soil_type: d.recommendedSoilType, 
          suitable_climate: d.suitableClimate, 
          planting_season: d.plantingSeason, 
          expected_yield_growth_time: d.expectedYieldGrowthTime, 
          quantity_available: d.quantityAvailable, 
          climate_type: d.climateType, 
          crop_type: d.cropType, 
          pack_quantity: d.packQuantity 
        };
      }
      break;
      
    case 'services':
      if (formData.service) {
        tableToInsert = 'service_details';
        const d = formData.service;
        dataToInsert = { 
          product_id: productId, 
          service_type: d.serviceType, 
          years_of_experience: d.yearsOfExperience, 
          mode_of_delivery: d.modeOfDelivery, 
          service_fee: d.serviceFee, 
          pricing_basis: d.pricingBasis, 
          availability_schedule: d.availabilitySchedule, 
          service_coverage_area: d.serviceCoverageArea, 
          duration_estimate: d.durationEstimate, 
          specialization: d.specialization, 
          tools_equipment_provided: d.toolsEquipmentProvided, 
          required_inputs: d.requiredInputs, 
          supporting_documents: d.supportingDocuments 
        };
      }
      break;
      
    case 'farm-produce':
      if (formData.produce) {
        tableToInsert = 'produce_details';
        const d = formData.produce;
        dataToInsert = { 
          product_id: productId, 
          perishability: d.perishability, 
          harvest_expiry_date: d.harvestExpiryDate || null, 
          type: d.type, 
          quantity_available: d.quantityAvailable 
        };
      }
      break;
      
    case 'horticulture-gardening':
      if (formData.horticulture) {
        tableToInsert = 'horticulture_details';
        const d = formData.horticulture;
        dataToInsert = { 
          product_id: productId, 
          botanical_name: d.botanicalName, 
          variety_type: d.varietyType, 
          plant_size_age: d.plantSizeAge, 
          soil_requirement: d.soilRequirement, 
          light_requirement: d.lightRequirement, 
          watering_frequency: d.wateringFrequency, 
          season_of_bloom_growth: d.seasonOfBloomGrowth, 
          fertilizer_recommendation: d.fertilizerRecommendation, 
          quantity_available: d.quantityAvailable 
        };
      }
      break;
      
    case 'fertilizers':
      if (formData.fertilizer) {
        tableToInsert = 'fertilizer_details';
        const d = formData.fertilizer;
        dataToInsert = { 
          product_id: productId, 
          fertilizer_type: d.fertilizerType, 
          brand_manufacturer: d.brandManufacturer, 
          formulation_state: d.formulationState, 
          application_method: d.applicationMethod, 
          quantity_available: d.quantityAvailable, 
          pack_size_weight: d.packSizeWeight, 
          minimum_order: d.minimumOrder 
        };
      }
      break;
      
    case 'animal-feed':
      if (formData.animalFeed) {
        tableToInsert = 'animal_feed_details';
        const d = formData.animalFeed;
        dataToInsert = { 
          product_id: productId, 
          feed_type: d.feedType, 
          ingredients: d.ingredients, 
          feed_name: d.feedName, 
          purpose_stage: d.purposeStage, 
          packaging_size: d.packagingSize, 
          quantity_available: d.quantityAvailable 
        };
      }
      break;
      
    case 'animal-pharmacy':
      if (formData.animalPharmacy) {
        tableToInsert = 'animal_pharmacy_details';
        const d = formData.animalPharmacy;
        dataToInsert = { 
          product_id: productId, 
          animal_type: d.animalType, 
          form_type: d.formType, 
          active_ingredients: d.activeIngredients, 
          dosage_instructions: d.dosageInstructions, 
          indications: d.indications, 
          contraindications: d.contraindications, 
          withdrawal_period: d.withdrawalPeriod, 
          pack_size: d.packSize, 
          package_type: d.packageType, 
          batch_number: d.batchNumber, 
          expiry_date: d.expiryDate || null, 
          nafdac_no: d.nafdacNo, 
          quantity_available: d.quantityAvailable, 
          minimum_order_quantity: d.minimumOrderQuantity 
        };
      }
      break;
      
    case 'animal-mating':
      if (formData.animalMating) {
        tableToInsert = 'animal_mating_details';
        const d = formData.animalMating;
        dataToInsert = { 
          product_id: productId, 
          breed: d.breed, 
          gender: d.gender, 
          age: d.age, 
          pedigree_status: d.pedigreeStatus, 
          special_traits: d.specialTraits, 
          breeding_history: d.breedingHistory, 
          fertility_tested: d.fertilityTested, 
          vaccination_status: d.vaccinationStatus, 
          available_for: d.availableFor 
        };
      }
      break;
      
    case 'animal-accessories':
      if (formData.animalAccessories) {
        tableToInsert = 'animal_accessories_details';
        const d = formData.animalAccessories;
        dataToInsert = { 
          product_id: productId, 
          suitable_animal_type: d.suitableAnimalType, 
          material_type: d.materialType, 
          brand_manufacturer: d.brandManufacturer, 
          size_dimension: d.sizeDimension, 
          quantity_available: d.quantityAvailable 
        };
      }
      break;
      
    case 'agro-chemicals':
      if (formData.agroChemicals) {
        tableToInsert = 'agro_chemicals_details';
        const d = formData.agroChemicals;
        dataToInsert = { 
          product_id: productId, 
          active_ingredient: d.activeIngredient, 
          brand_manufacturer: d.brandManufacturer, 
          application_method: d.applicationMethod, 
          formulation_type: d.formulationType, 
          toxicity_level: d.toxicityLevel, 
          quantity_available: d.quantityAvailable, 
          pack_size: d.packSize 
        };
      }
      break;
  }
  
  if (tableToInsert && dataToInsert) {
    Object.keys(dataToInsert).forEach(key => {
      if (dataToInsert[key] === undefined) {
        delete dataToInsert[key];
      }
    });
    
    const { error } = await supabase.from(tableToInsert).insert(dataToInsert);
    categoryError = error;
  }
  
  if (categoryError) {
    await supabase.from('ads').delete().match({ id: productId });
    throw new Error(`Failed to save details: ${categoryError.message}`);
  }
  
  return productData;
};

// --- MAIN COMPONENT ---
export const PostNewAdScreen: React.FC<PostNewAdScreenProps> = ({
  navigation,
  route,
}) => {
  const [formData, setFormData] = useState<SellFormData>(getInitialFormData());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Submitting...');
  const [modalVisible, setModalVisible] = useState(false); 
  
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  // Load draft on mount
  useEffect(() => {
    if (route.params?.selectedCategory || route.params?.selectedSubcategory) {
      return;
    }
    
    const loadDraft = async () => {
      try {
        const draftString = await AsyncStorage.getItem(DRAFT_KEY);
        if (draftString) {
          Alert.alert(
            'Resume Draft',
            'You have an unfinished listing. Would you like to resume?',
            [
              { 
                text: 'Discard', 
                style: 'destructive', 
                onPress: () => AsyncStorage.removeItem(DRAFT_KEY) 
              },
              { 
                text: 'Resume', 
                style: 'default', 
                onPress: () => {
                  const draftData = JSON.parse(draftString) as SellFormData;
                  setFormData(draftData);
                  
                  if (draftData.categoryId) {
                    const category = getCategoryById(draftData.categoryId);
                    if (category) setSelectedCategory(category);
                  }
                  
                  if (draftData.subcategoryId && draftData.categoryId) {
                    const subcategories = getSubcategoriesByCategory(draftData.categoryId);
                    const subcategory = subcategories.find(sub => sub.id === draftData.subcategoryId);
                    if (subcategory) setSelectedSubcategory(subcategory);
                  }
                },
              },
            ]
          );
        }
      } catch (e) { 
        console.error('Failed to load draft:', e); 
      }
    };
    
    loadDraft();
  }, []);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
    
    autoSaveInterval.current = setInterval(() => {
      if (!isLoading && (formData.categoryId || formData.productTitle)) {
        AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      }
    }, 10000); 
    
    return () => { 
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current); 
    };
  }, [formData, isLoading]);

  // Handle navigation params (category/subcategory selection)
  useEffect(() => {
    if (!route.params) return;
    
    // Handle subcategory selection
    if (route.params.selectedSubcategory) {
      const subcategory = route.params.selectedSubcategory;
      setSelectedSubcategory(subcategory);
      
      // FIXED: Only update category/subcategory fields, preserve everything else
      setFormData(prev => ({
        ...prev, // Keep all existing form data
        categoryId: route.params?.selectedCategory?.id || prev.categoryId,
        categoryName: route.params?.selectedCategory?.name || prev.categoryName,
        subcategoryId: subcategory.id,
        subcategoryName: subcategory.name,
      }));
      
      if (route.params.selectedCategory) {
        setSelectedCategory(route.params.selectedCategory);
      }
      
      navigation.setParams({ selectedCategory: undefined, selectedSubcategory: undefined });
    } 
    // Handle category selection
    else if (route.params.selectedCategory) {
      const category = route.params.selectedCategory;
      setSelectedCategory(category);
      
      // FIXED: Only update category fields, preserve everything else
      setFormData(prev => ({
        ...prev, // Keep all existing form data
        categoryId: category.id,
        categoryName: category.name,
        subcategoryId: null, // Reset subcategory when category changes
        subcategoryName: '',
      }));

      navigation.setParams({ selectedCategory: undefined });

      // Navigate to subcategory selection if category has subcategories
      if (category.subcategories && category.subcategories.length > 0) {
        navigation.navigate('SubcategorySelection', {
          category: category,
          currentSubcategory: undefined, 
        });
      }
    }
  }, [route.params, navigation]);

  const handleClear = () => {
    Alert.alert(
      'Clear Form',
      'Are you sure you want to clear all fields? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive', 
          onPress: () => {
            setFormData(getInitialFormData());
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            AsyncStorage.removeItem(DRAFT_KEY);
          },
        },
      ]
    );
  };

  const handleCategoryPress = () => {
    navigation.navigate('CategorySelection', {
      currentCategory: selectedCategory || undefined,
    });
  };

  const handlePreview = () => {
    const { isValid, errors } = validateForm(formData, selectedCategory?.slug || null);
    if (!isValid) {
      Alert.alert(
        'Validation Error', 
        'Please fix the following errors before previewing:\n\n' + errors.join('\n')
      );
      return;
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (isLoading) return; 

    if (modalVisible) {
      setModalVisible(false);
    }
    
    const { isValid, errors } = validateForm(formData, selectedCategory?.slug || null);
    if (!isValid) {
      Alert.alert('Validation Error', errors.join('\n'));
      return; 
    }

    let userId: string;
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        Alert.alert('Not Logged In', 'You must be logged in to post an ad.');
        return;
      }
      userId = user.id;
    } catch (authError) {
      Alert.alert('Authentication Error', 'Could not verify user. Please log in again.');
      return;
    }

    setIsLoading(true);
    
    try {
      setLoadingMessage('Uploading images...');
      const imageUrls = await uploadImagesToCloud(formData.images, userId);
      
      const finalFormData = { ...formData, images: imageUrls };

      setLoadingMessage('Saving ad...');
      await submitListingToSupabase(finalFormData, selectedCategory!.slug, userId);

      setIsLoading(false);
      await AsyncStorage.removeItem(DRAFT_KEY);

      Alert.alert(
      '🎉 Ad Posted!',
      'Your ad has been posted successfully. Would you like to boost it for more visibility?',
      [
        {
      text: 'Not Now',
      style: 'cancel',
      onPress: () => {
        setFormData(getInitialFormData());
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        navigation.getParent()?.navigate('HomeTab', { screen: 'MyAds' });
      }
    },
    {
      text: '⚡ Boost Ad',
      onPress: () => {
        setFormData(getInitialFormData());
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        navigation.getParent()?.navigate('MoreTab', { screen: 'Subscriptions' });
      }
    }
  ]
);

    } catch (error: any) {
      setIsLoading(false);
      console.error('Submission failed:', error);
      Alert.alert('Submission Error', error.message || 'An unknown error occurred.');
    }
  };

  const updateFormData = (updates: Partial<SellFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const renderCategorySpecificFields = () => {
    if (!selectedCategory) return null;
    
    switch (selectedCategory.slug) {
      case 'tractors-farm-equipments': 
        return <EquipmentFields formData={formData} updateFormData={updateFormData} />;
      case 'livestock-pets': 
        return <LivestockFields formData={formData} updateFormData={updateFormData} />;
      case 'seedlings-seeds': 
        return <SeedlingFields formData={formData} updateFormData={updateFormData} />;
      case 'farm-produce': 
        return <ProduceFields formData={formData} updateFormData={updateFormData} />;
      case 'fertilizers': 
        return <FertilizerFields formData={formData} updateFormData={updateFormData} />;
      case 'agro-chemicals': 
        return <AgroChemicalsFields formData={formData} updateFormData={updateFormData} />;
      case 'animal-feed': 
        return <AnimalFeedFields formData={formData} updateFormData={updateFormData} />;
      case 'animal-pharmacy': 
        return <AnimalPharmacyFields formData={formData} updateFormData={updateFormData} />;
      case 'animal-accessories': 
        return <AnimalAccessoriesFields formData={formData} updateFormData={updateFormData} />;
      case 'animal-mating': 
        return <AnimalMatingFields formData={formData} updateFormData={updateFormData} />;
      case 'horticulture-gardening': 
        return <HorticultureFields formData={formData} updateFormData={updateFormData} />;
      case 'services': 
        return <ServiceFields formData={formData} updateFormData={updateFormData} />;
      default: 
        return (
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderText}>No specific fields for this category.</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post New Ad</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>
        </View>
        
        <CommonFields formData={formData} updateFormData={updateFormData} />
        
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Category<Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity style={styles.selectButton} onPress={handleCategoryPress}>
            <Text style={[
              styles.selectButtonText, 
              !selectedCategory && styles.selectButtonPlaceholder
            ]}>
              {selectedCategory ? selectedCategory.name : 'Select Category'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
        
        {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Sub-Category</Text>
            <TouchableOpacity 
              style={styles.selectButton} 
              onPress={() => navigation.navigate('SubcategorySelection', { 
                category: selectedCategory, 
                currentSubcategory: selectedSubcategory || undefined 
              })}
            >
              <Text style={[
                styles.selectButtonText, 
                !selectedSubcategory && styles.selectButtonPlaceholder
              ]}>
                {selectedSubcategory ? selectedSubcategory.name : 'Select subcategory'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {renderCategorySpecificFields()}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Availability</Text>
        </View>
        <PricingFields formData={formData} updateFormData={updateFormData} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <LocationFields formData={formData} updateFormData={updateFormData} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
        </View>
        <ContactFields formData={formData} updateFormData={updateFormData} />
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={handlePreview}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Text style={styles.previewButtonText}>Preview Ad</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#FFFFFF" style={styles.spinner} />
                <Text style={styles.submitButtonText}>{loadingMessage}</Text>
              </>
            ) : (
              <Text style={styles.submitButtonText}>Submit Ad</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      <PreviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onPublish={handleSubmit}
        formData={formData}
        category={selectedCategory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    paddingTop: 60, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  backButton: { 
    fontSize: 28, 
    color: '#111827' 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  clearButton: { 
    fontSize: 16, 
    color: '#00A651', 
    fontWeight: '600' 
  },
  scrollView: { 
    flex: 1 
  },
  section: { 
    backgroundColor: '#F9FAFB', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    marginTop: 16 
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#6B7280', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  fieldContainer: { 
    paddingHorizontal: 16, 
    marginTop: 16 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 8 
  },
  required: { 
    color: '#EF4444' 
  },
  selectButton: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 8, 
    padding: 16 
  },
  selectButtonText: { 
    fontSize: 16, 
    color: '#111827' 
  },
  selectButtonPlaceholder: { 
    color: '#9CA3AF' 
  },
  chevron: { 
    fontSize: 24, 
    color: '#9CA3AF' 
  },
  placeholderSection: { 
    marginHorizontal: 16, 
    marginTop: 16, 
    padding: 16, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderStyle: 'dashed' 
  },
  placeholderText: { 
    fontSize: 14, 
    color: '#6B7280', 
    textAlign: 'center', 
    fontStyle: 'italic' 
  },
  actionButtons: { 
    paddingHorizontal: 16, 
    marginTop: 24 
  },
  previewButton: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: '#00A651', 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center', 
    marginBottom: 12 
  },
  previewButtonText: { 
    color: '#00A651', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  submitButton: { 
    backgroundColor: '#00A651', 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center' 
  },
  submitButtonDisabled: { 
    backgroundColor: '#A1A1AA' 
  },
  submitButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  spinner: { 
    marginRight: 10 
  },
  bottomPadding: { 
    height: 40 
  },
});