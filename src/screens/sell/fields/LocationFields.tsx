// src/screens/sell/fields/LocationFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData } from '../../../types/sellForm';

interface LocationFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const LocationFields: React.FC<LocationFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const handleLocationPress = () => {
    // TODO: Navigate to location picker or use geolocation
    console.log('Location picker - to be implemented');
  };

  return (
    <>
      {/* Location */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Location</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={handleLocationPress}
        >
          <Text
            style={[
              styles.selectButtonText,
              !formData.location.state && styles.selectButtonPlaceholder,
            ]}
          >
            {formData.location.state && formData.location.lga
              ? `${formData.location.state}, ${formData.location.lga}`
              : 'Choose product location'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Address */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Street name, Landmark"
          placeholderTextColor="#9CA3AF"
          value={formData.location.address}
          onChangeText={(text) =>
            updateFormData({
              location: { ...formData.location, address: text },
            })
          }
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
});