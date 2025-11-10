// src/screens/sell/fields/AnimalPharmacyFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData, AnimalPharmacyFields as AnimalPharmacyFieldsType } from '../../../types/sellForm';

interface AnimalPharmacyFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const AnimalPharmacyFields: React.FC<AnimalPharmacyFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const pharmacy = formData.animalPharmacy || {};

  const updatePharmacyField = (field: keyof AnimalPharmacyFieldsType, value: any) => {
    updateFormData({
      animalPharmacy: { ...pharmacy, [field]: value },
    });
  };

  return (
    <>
      {/* Animal Type */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Animal Type</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Dog, Cat, Dog & Cat, Poultry"
          placeholderTextColor="#9CA3AF"
          value={pharmacy.animalType || ''}
          onChangeText={(text) => updatePharmacyField('animalType', text)}
        />
      </View>

      {/* Form Type - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Form Type</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {pharmacy.formType || 'Select administration type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Active Ingredients */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Active Ingredients</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Cypermethrin"
          placeholderTextColor="#9CA3AF"
          value={pharmacy.activeIngredients || ''}
          onChangeText={(text) => updatePharmacyField('activeIngredients', text)}
        />
      </View>

      {/* Dosage Instructions */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Dosage Instructions</Text>
        <TextInput
          style={styles.textArea}
          placeholder="E.g Measure body weight orally for 3 days"
          placeholderTextColor="#9CA3AF"
          value={pharmacy.dosageInstructions || ''}
          onChangeText={(text) => updatePharmacyField('dosageInstructions', text)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Indications */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Indications</Text>
        <TextInput
          style={styles.textArea}
          placeholder="E.g For treatment of respiratory infections"
          placeholderTextColor="#9CA3AF"
          value={pharmacy.indications || ''}
          onChangeText={(text) => updatePharmacyField('indications', text)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Contraindications */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Contraindications</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Avoid overdose, animals"
          placeholderTextColor="#9CA3AF"
          value={pharmacy.contraindications || ''}
          onChangeText={(text) => updatePharmacyField('contraindications', text)}
        />
      </View>

      {/* Withdrawal Period */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Withdrawal Period</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Meat, 3 days for milk"
          placeholderTextColor="#9CA3AF"
          value={pharmacy.withdrawalPeriod || ''}
          onChangeText={(text) => updatePharmacyField('withdrawalPeriod', text)}
        />
      </View>

      {/* Section: Packaging & Expiry */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Packaging & Expiry</Text>
      </View>

      {/* Pack Size */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Pack Size</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 100ml, 50 tablets, 1kg"
          placeholderTextColor="#9CA3AF"
          value={pharmacy.packSize || ''}
          onChangeText={(text) => updatePharmacyField('packSize', text)}
        />
      </View>

      {/* Package Type - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Package Type</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {pharmacy.packageType || 'Select package type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Batch Number (optional) */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Batch Number (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter batch number"
          placeholderTextColor="#9CA3AF"
          value={pharmacy.batchNumber || ''}
          onChangeText={(text) => updatePharmacyField('batchNumber', text)}
        />
      </View>

      {/* Expiry Date */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Expiry Date</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {pharmacy.expiryDate || 'Select date'}
          </Text>
          <Text style={styles.chevron}>📅</Text>
        </TouchableOpacity>
      </View>

      {/* NAFDAC No. (optional) */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>NAFDAC No. (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter NAFDAC No"
          placeholderTextColor="#9CA3AF"
          value={pharmacy.nafdacNo || ''}
          onChangeText={(text) => updatePharmacyField('nafdacNo', text)}
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
          value={pharmacy.quantityAvailable || ''}
          onChangeText={(text) => updatePharmacyField('quantityAvailable', text)}
        />
      </View>

      {/* Minimum Order Quantity (Optional) */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Minimum Order Quantity (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 50 seedlings"
          placeholderTextColor="#9CA3AF"
          value={pharmacy.minimumOrderQuantity || ''}
          onChangeText={(text) => updatePharmacyField('minimumOrderQuantity', text)}
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
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
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
  sectionHeader: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});