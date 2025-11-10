// src/screens/sell/fields/EquipmentFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData, EquipmentFields as EquipmentFieldsType } from '../../../types/sellForm';

interface EquipmentFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const EquipmentFields: React.FC<EquipmentFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const equipment = formData.equipment || {};

  const updateEquipmentField = (field: keyof EquipmentFieldsType, value: any) => {
    updateFormData({
      equipment: { ...equipment, [field]: value },
    });
  };

  return (
    <>
      {/* Quantity Available */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Quantity Available<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 120 bags"
          placeholderTextColor="#9CA3AF"
          value={equipment.quantityAvailable || ''}
          onChangeText={(text) => updateEquipmentField('quantityAvailable', text)}
        />
      </View>

      {/* Brand/Manufacturer */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Brand/Manufacturer</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g John Deere"
          placeholderTextColor="#9CA3AF"
          value={equipment.brandManufacturer || ''}
          onChangeText={(text) => updateEquipmentField('brandManufacturer', text)}
        />
      </View>

      {/* Condition - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Condition</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {equipment.condition || 'Select equipment condition'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Power */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Power</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter equipment power E.g 80HP"
          placeholderTextColor="#9CA3AF"
          value={equipment.power || ''}
          onChangeText={(text) => updateEquipmentField('power', text)}
        />
      </View>

      {/* Fuel Type - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Fuel Type</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {equipment.fuelType || 'Select fuel type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Transmission Type - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Transmission Type</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {equipment.transmissionType || 'Select transmission type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Year of Manufacture */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Year of Manufacture</Text>
        <TextInput
          style={styles.input}
          placeholder="Select year of manufacture"
          placeholderTextColor="#9CA3AF"
          value={equipment.yearOfManufacture || ''}
          onChangeText={(text) => updateEquipmentField('yearOfManufacture', text)}
          keyboardType="numeric"
        />
      </View>

      {/* Hours of Use */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Hours of Use</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter hours of use of equipment"
          placeholderTextColor="#9CA3AF"
          value={equipment.hoursOfUse || ''}
          onChangeText={(text) => updateEquipmentField('hoursOfUse', text)}
          keyboardType="numeric"
        />
      </View>

      {/* Functionality Status - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Functionality Status</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {equipment.functionalityStatus || 'Select functionality status'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Availability - Radio */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Availability</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateEquipmentField('availability', 'for_sale')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {equipment.availability === 'for_sale' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>For Sale</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateEquipmentField('availability', 'for_rent')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {equipment.availability === 'for_rent' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>For Rent</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rental Rate - Conditional */}
      {equipment.availability === 'for_rent' && (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Rental Rate</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g ₦100,000 per day/week"
            placeholderTextColor="#9CA3AF"
            value={equipment.rentalRate || ''}
            onChangeText={(text) => updateEquipmentField('rentalRate', text)}
          />
        </View>
      )}
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