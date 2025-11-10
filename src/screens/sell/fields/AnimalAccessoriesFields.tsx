// src/screens/sell/fields/AnimalAccessoriesFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData, AnimalAccessoriesFields as AnimalAccessoriesFieldsType } from '../../../types/sellForm';

interface AnimalAccessoriesFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const AnimalAccessoriesFields: React.FC<AnimalAccessoriesFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const accessories = formData.animalAccessories || {};

  const updateAccessoriesField = (field: keyof AnimalAccessoriesFieldsType, value: any) => {
    updateFormData({
      animalAccessories: { ...accessories, [field]: value },
    });
  };

  return (
    <>
      {/* Suitable Animal Type - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Suitable Animal Type</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {accessories.suitableAnimalType || 'Select animal type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Material Type */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Material Type</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Dangote Fertilizer, Notore Fertilizer"
          placeholderTextColor="#9CA3AF"
          value={accessories.materialType || ''}
          onChangeText={(text) => updateAccessoriesField('materialType', text)}
        />
      </View>

      {/* Brand/Manufacturer */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Brand/Manufacturer</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g PetWorld, AgroVet Tools"
          placeholderTextColor="#9CA3AF"
          value={accessories.brandManufacturer || ''}
          onChangeText={(text) => updateAccessoriesField('brandManufacturer', text)}
        />
      </View>

      {/* Size/Dimension */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Size/Dimension</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Medium - 40cm, Large - 2L Capacity"
          placeholderTextColor="#9CA3AF"
          value={accessories.sizeDimension || ''}
          onChangeText={(text) => updateAccessoriesField('sizeDimension', text)}
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
          value={accessories.quantityAvailable || ''}
          onChangeText={(text) => updateAccessoriesField('quantityAvailable', text)}
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