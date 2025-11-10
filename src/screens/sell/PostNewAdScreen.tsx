// src/screens/sell/PostNewAdScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SellStackParamList, Category, Subcategory } from '../../navigation/types';
import { SellFormData } from '../../types/sellForm';
import { getSubcategoriesByCategory } from '../../data/categoryConfig';
import { CommonFields } from './fields/CommonFields';
import { PricingFields } from './fields/PricingFields';
import { LocationFields } from './fields/LocationFields';
import { ContactFields } from './fields/ContactFields';

// Category-specific field imports
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

type PostNewAdNavigationProp = StackNavigationProp<SellStackParamList, 'PostNewAd'>;
type PostNewAdRouteProp = RouteProp<SellStackParamList, 'PostNewAd'>;

interface PostNewAdScreenProps {
  navigation: PostNewAdNavigationProp;
  route: PostNewAdRouteProp;
}

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
  location: {
    state: '',
    lga: '',
    address: '',
  },
  contact: {
    name: '',
    businessName: '',
    phone: '',
    availableOnWhatsapp: false,
  },
});

export const PostNewAdScreen: React.FC<PostNewAdScreenProps> = ({
  navigation,
  route,
}) => {
  const [formData, setFormData] = useState<SellFormData>(getInitialFormData());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);

  // Handle category/subcategory selection from navigation params
  useEffect(() => {
    if (route.params?.selectedCategory) {
      const category = route.params.selectedCategory;
      setSelectedCategory(category);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        categoryId: category.id,
        categoryName: category.name,
        // Clear subcategory if category changed
        subcategoryId: null,
        subcategoryName: '',
      }));

      // If category has subcategories, navigate to subcategory selection
      if (category.hasSubcategories) {
        const subcategories = getSubcategoriesByCategory(category.id);
        if (subcategories.length > 0) {
          navigation.navigate('SubcategorySelection', {
            category: category,
            currentSubcategory: route.params.selectedSubcategory,
          });
        }
      }
    }

    if (route.params?.selectedSubcategory) {
      const subcategory = route.params.selectedSubcategory;
      setSelectedSubcategory(subcategory);
      
      setFormData(prev => ({
        ...prev,
        subcategoryId: subcategory.id,
        subcategoryName: subcategory.name,
      }));
    }
  }, [route.params?.selectedCategory, route.params?.selectedSubcategory]);

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
    // TODO: Validate form
    console.log('Preview Ad', formData);
    Alert.alert('Preview', 'Preview functionality coming soon');
  };

  const handleSubmit = () => {
    // TODO: Validate form
    // TODO: Submit to Supabase
    console.log('Submit Ad', formData);
    Alert.alert('Submit', 'Submit functionality coming soon');
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
              <Text style={styles.placeholderText}>
                No specific fields for this category.
              </Text>
            </View>
          );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post New Ad</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Product Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>
        </View>

        {/* Common Fields: Title, Description, Images */}
        <CommonFields formData={formData} updateFormData={updateFormData} />

        {/* Category Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Category<Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleCategoryPress}
          >
            <Text
              style={[
                styles.selectButtonText,
                !selectedCategory && styles.selectButtonPlaceholder,
              ]}
            >
              {selectedCategory ? selectedCategory.name : 'Select Category'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Subcategory (if category has subcategories) */}
        {selectedCategory?.hasSubcategories && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Sub-Category</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() =>
                navigation.navigate('SubcategorySelection', {
                  category: selectedCategory,
                  currentSubcategory: selectedSubcategory || undefined,
                })
              }
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !selectedSubcategory && styles.selectButtonPlaceholder,
                ]}
              >
                {selectedSubcategory
                  ? selectedSubcategory.name
                  : 'Select subcategory'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Category-Specific Fields */}
        {renderCategorySpecificFields()}

        {/* Section: Pricing & Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Availability</Text>
        </View>
        <PricingFields formData={formData} updateFormData={updateFormData} />

        {/* Section: Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <LocationFields formData={formData} updateFormData={updateFormData} />

        {/* Section: Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
        </View>
        <ContactFields formData={formData} updateFormData={updateFormData} />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={handlePreview}
            activeOpacity={0.8}
          >
            <Text style={styles.previewButtonText}>Preview Ad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Submit Ad</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 28,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearButton: {
    fontSize: 16,
    color: '#00A651',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  selectButtonPlaceholder: {
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  placeholderSection: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  previewButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#00A651',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  previewButtonText: {
    color: '#00A651',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#00A651',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});