// src/screens/sell/fields/FertilizerFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData, FertilizerFields as FertilizerFieldsType } from '../../../types/sellForm';
import { CustomDropdown } from '../../../components/forms/CustomDropdown';
import { DROPDOWN_OPTIONS } from '../../../data/categoryConfig';

interface FertilizerFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const FertilizerFields: React.FC<FertilizerFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const fertilizer = formData.fertilizer || {
    fertilizerType: '',
    formulationState: '',
  };

  const updateFertilizerField = (field: keyof FertilizerFieldsType, value: any) => {
    updateFormData({
      fertilizer: { ...fertilizer, [field]: value },
    });
  };

  return (
    <>
      {/* Fertilizer Type - Dropdown */}
      <CustomDropdown
        label="Fertilizer Type"
        value={fertilizer.fertilizerType || ''}
        options={DROPDOWN_OPTIONS.fertilizerCondition}
        placeholder="Select fertilizer type"
        onChange={(value) => updateFertilizerField('fertilizerType', value)}
      />

      {/* Brand/Manufacturer */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Brand/Manufacturer</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Dangote Fertilizer, Notore Fertilizer"
          placeholderTextColor="#9CA3AF"
          value={fertilizer.brandManufacturer || ''}
          onChangeText={(text) => updateFertilizerField('brandManufacturer', text)}
        />
      </View>

      {/* Formulation/State - Dropdown */}
      <CustomDropdown
        label="Formulation/State"
        value={fertilizer.formulationState || ''}
        options={DROPDOWN_OPTIONS.fertilizerFormulation}
        placeholder="Select state"
        onChange={(value) => updateFertilizerField('formulationState', value)}
      />

      {/* Application Method */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Application Method</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Apply 1 bag per hectare during planting"
          placeholderTextColor="#9CA3AF"
          value={fertilizer.applicationMethod || ''}
          onChangeText={(text) => updateFertilizerField('applicationMethod', text)}
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
          value={fertilizer.quantityAvailable || ''}
          onChangeText={(text) => updateFertilizerField('quantityAvailable', text)}
        />
      </View>

      {/* Pack Size/Weight */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Pack Size/Weight</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 50kg bag, 10L can"
          placeholderTextColor="#9CA3AF"
          value={fertilizer.packSizeWeight || ''}
          onChangeText={(text) => updateFertilizerField('packSizeWeight', text)}
        />
      </View>

      {/* Minimum Order (Optional) */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Minimum Order (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 5 bags"
          placeholderTextColor="#9CA3AF"
          value={fertilizer.minimumOrder || ''}
          onChangeText={(text) => updateFertilizerField('minimumOrder', text)}
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