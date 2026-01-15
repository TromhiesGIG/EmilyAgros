// src/screens/sell/fields/LocationFields.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData } from '../../../types/sellForm';
import { CustomDropdown } from '../../../components/forms/CustomDropdown';
import { NIGERIAN_STATES, LGAS } from '../../../data/nigerianLocations';

interface LocationFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const LocationFields: React.FC<LocationFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const location = formData.location || { state: '', lga: '', address: '' };

  // Get the list of LGAs for the currently selected state
  const [lgaOptions, setLgaOptions] = useState<typeof NIGERIAN_STATES>(() => {
    // Initialize with LGAs if a state is already selected
    return location.state ? LGAS[location.state] || [] : [];
  });

  // Handle state change: update state and reset LGA
  const handleStateChange = (stateValue: string) => {
    // Get the new list of LGAs
    const newLgaOptions = LGAS[stateValue] || [];
    setLgaOptions(newLgaOptions);
    
    // Update form data: set new state, clear LGA
    updateFormData({
      location: {
        ...location,
        state: stateValue,
        lga: '', // Reset LGA when state changes
      },
    });
  };

  // Handle LGA change
  const handleLgaChange = (lgaValue: string) => {
    updateFormData({
      location: { ...location, lga: lgaValue },
    });
  };

  return (
    <>
      {/* State Dropdown */}
      <CustomDropdown
        label="State"
        value={location.state}
        options={NIGERIAN_STATES}
        placeholder="Select state"
        onChange={handleStateChange}
        required // Location is required
      />

      {/* LGA Dropdown */}
      <CustomDropdown
        label="LGA"
        value={location.lga}
        options={lgaOptions}
        placeholder={location.state ? 'Select LGA' : 'Select state first'}
        onChange={handleLgaChange}
        required // Location is required
      />

      {/* Address */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Street name, Landmark"
          placeholderTextColor="#9CA3AF"
          value={location.address}
          onChangeText={(text) =>
            updateFormData({
              location: { ...location, address: text },
            })
          }
        />
      </View>
    </>
  );
};

// Removed old button-related styles:
// selectButton, selectButtonText, selectButtonPlaceholder, chevron
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