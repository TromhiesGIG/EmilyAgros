// src/screens/sell/fields/SeedlingFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData, SeedlingFields as SeedlingFieldsType } from '../../../types/sellForm';

interface SeedlingFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const SeedlingFields: React.FC<SeedlingFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const seedling = formData.seedling || {};

  const updateSeedlingField = (field: keyof SeedlingFieldsType, value: any) => {
    updateFormData({
      seedling: { ...seedling, [field]: value },
    });
  };

  return (
    <>
      {/* Type/Variety - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Type/Variety</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {seedling.typeVariety || 'Select seed type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Seedling Age */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Seedling Age</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 2 weeks, 1 month"
          placeholderTextColor="#9CA3AF"
          value={seedling.seedlingAge || ''}
          onChangeText={(text) => updateSeedlingField('seedlingAge', text)}
        />
      </View>

      {/* Recommended Soil Type */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Recommended Soil Type</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 2 weeks, 1 month"
          placeholderTextColor="#9CA3AF"
          value={seedling.recommendedSoilType || ''}
          onChangeText={(text) => updateSeedlingField('recommendedSoilType', text)}
        />
      </View>

      {/* Suitable Climate - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Suitable Climate</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {seedling.suitableClimate || 'Select climate type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Planting Season */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Planting Season</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Rainy Season"
          placeholderTextColor="#9CA3AF"
          value={seedling.plantingSeason || ''}
          onChangeText={(text) => updateSeedlingField('plantingSeason', text)}
        />
      </View>

      {/* Expected Yield/Growth Time */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Expected Yield/Growth Time</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Harvest after 90 days"
          placeholderTextColor="#9CA3AF"
          value={seedling.expectedYieldGrowthTime || ''}
          onChangeText={(text) => updateSeedlingField('expectedYieldGrowthTime', text)}
        />
      </View>

      {/* Quantity Available */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Quantity Available<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 120 bags"
          placeholderTextColor="#9CA3AF"
          value={seedling.quantityAvailable || ''}
          onChangeText={(text) => updateSeedlingField('quantityAvailable', text)}
        />
      </View>

      {/* Climate Type - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Climate Type</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {seedling.climateType || 'Select climate type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Crop Type - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Crop Type</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {seedling.cropType || 'Select crop type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Pack/Quantity */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Pack/Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 1 pot, Bundle of 10 seedlings"
          placeholderTextColor="#9CA3AF"
          value={seedling.packQuantity || ''}
          onChangeText={(text) => updateSeedlingField('packQuantity', text)}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#111827',
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
  selectButtonPlaceholder: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  chevron: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});