// src/screens/sell/fields/ProduceFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData, ProduceFields as ProduceFieldsType } from '../../../types/sellForm';

interface ProduceFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const ProduceFields: React.FC<ProduceFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const produce = formData.produce || {};

  const updateProduceField = (field: keyof ProduceFieldsType, value: any) => {
    updateFormData({
      produce: { ...produce, [field]: value },
    });
  };

  return (
    <>
      {/* Perishability - Radio */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Perishability</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateProduceField('perishability', 'perishable')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {produce.perishability === 'perishable' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Perishable</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateProduceField('perishability', 'non_perishable')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {produce.perishability === 'non_perishable' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Non-Perishable</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Harvest/Expiry Date */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Harvest/Expiry Date</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {produce.harvestExpiryDate || 'Choose date'}
          </Text>
          <Text style={styles.chevron}>📅</Text>
        </TouchableOpacity>
      </View>

      {/* Type - Radio */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateProduceField('type', 'organic')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {produce.type === 'organic' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>Organic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateProduceField('type', 'inorganic')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {produce.type === 'inorganic' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>Inorganic</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quantity Available */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Quantity Available<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 10kg, 25 packs etc."
          placeholderTextColor="#9CA3AF"
          value={produce.quantityAvailable || ''}
          onChangeText={(text) => updateProduceField('quantityAvailable', text)}
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