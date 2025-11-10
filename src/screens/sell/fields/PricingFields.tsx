// src/screens/sell/fields/PricingFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData } from '../../../types/sellForm';

interface PricingFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const PricingFields: React.FC<PricingFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <>
      {/* Price */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Price (₦)<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 25,000"
          placeholderTextColor="#9CA3AF"
          value={formData.price}
          onChangeText={(text) => updateFormData({ price: text })}
          keyboardType="numeric"
        />
      </View>

      {/* Are you open to negotiation? */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Are you open to negotiation?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateFormData({ negotiable: true })}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {formData.negotiable && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateFormData({ negotiable: false })}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {!formData.negotiable && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>No</Text>
          </TouchableOpacity>
        </View>
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
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00A651',
  },
  radioLabel: {
    fontSize: 16,
    color: '#111827',
  },
});