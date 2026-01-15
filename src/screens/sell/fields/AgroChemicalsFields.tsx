// src/screens/sell/fields/AgroChemicalsFields.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SellFormData, AgroChemicalsFields as AgroChemicalsFieldsType } from '../../../types/sellForm';

interface AgroChemicalsFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const AgroChemicalsFields: React.FC<AgroChemicalsFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const chemicals = formData.agroChemicals || {
    activeIngredient: '',
    brandManufacturer: '',
    applicationMethod: '',
    formulationType: '',
    toxicityLevel: '',
    quantityAvailable: '',
    packSize: '',
  };

  const updateChemicalsField = (field: keyof AgroChemicalsFieldsType, value: any) => {
    updateFormData({
      agroChemicals: { ...chemicals, [field]: value },
    });
  };

  return (
    <>
      {/* Active Ingredient */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Active Ingredient</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Cypermethrin 10% EC"
          placeholderTextColor="#9CA3AF"
          value={chemicals.activeIngredient || ''}
          onChangeText={(text) => updateChemicalsField('activeIngredient', text)}
        />
      </View>

      {/* Brand/Manufacturer */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Brand/Manufacturer</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Bayer CropScience"
          placeholderTextColor="#9CA3AF"
          value={chemicals.brandManufacturer || ''}
          onChangeText={(text) => updateChemicalsField('brandManufacturer', text)}
        />
      </View>

      {/* Application Method */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Application Method</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Spray on crops with 10L water per acre"
          placeholderTextColor="#9CA3AF"
          value={chemicals.applicationMethod || ''}
          onChangeText={(text) => updateChemicalsField('applicationMethod', text)}
        />
      </View>

      {/* Formulation Type */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Formulation Type</Text>        
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {chemicals.formulationType || 'Select formulation type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Toxicity Level */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Toxicity Level</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Low/Moderate/High"
          placeholderTextColor="#9CA3AF"
          value={chemicals.toxicityLevel || ''}
          onChangeText={(text) => updateChemicalsField('toxicityLevel', text)}
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
          value={chemicals.quantityAvailable || ''}
          onChangeText={(text) => updateChemicalsField('quantityAvailable', text)}
        />
      </View>

      {/* Pack Size */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Pack Size</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 1L bottle, 100ml sachet"
          placeholderTextColor="#9CA3AF"
          value={chemicals.packSize || ''}
          onChangeText={(text) => updateChemicalsField('packSize', text)}
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