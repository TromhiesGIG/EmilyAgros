// src/screens/sell/fields/HorticultureFields.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SellFormData, HorticultureFields as HorticultureFieldsType } from '../../../types/sellForm';

interface HorticultureFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const HorticultureFields: React.FC<HorticultureFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const horticulture = formData.horticulture || {
    botanicalName: '',
    varietyType: '',
    plantSizeAge: '',
    soilRequirement: '',
    lightRequirement: '',
    wateringFrequency: '',
    seasonOfBloomGrowth: '',
    fertilizerRecommendation: '',
    quantityAvailable: '',
  };

  const updateHorticultureField = (field: keyof HorticultureFieldsType, value: any) => {
    updateFormData({
      horticulture: { ...horticulture, [field]: value },
    });
  };

  return (
    <>
      {/* Botanical Name (optional) */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Botanical Name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter botanical name"
          placeholderTextColor="#9CA3AF"
          value={horticulture.botanicalName || ''}
          onChangeText={(text) => updateHorticultureField('botanicalName', text)}
        />
      </View>

      {/* Variety/Type */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Variety/Type</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Hybrid Rose"
          placeholderTextColor="#9CA3AF"
          value={horticulture.varietyType || ''}
          onChangeText={(text) => updateHorticultureField('varietyType', text)}
        />
      </View>

      {/* Plant Size/Age */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Plant Size/Age</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Seedling, Medium (6 months)"
          placeholderTextColor="#9CA3AF"
          value={horticulture.plantSizeAge || ''}
          onChangeText={(text) => updateHorticultureField('plantSizeAge', text)}
        />
      </View>

      {/* Soil Requirement */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Soil Requirement</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Loamy, well-drained soil"
          placeholderTextColor="#9CA3AF"
          value={horticulture.soilRequirement || ''}
          onChangeText={(text) => updateHorticultureField('soilRequirement', text)}
        />
      </View>

      {/* Light Requirement */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Light Requirement</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Full Sun, Partial Shade, Indoor etc."
          placeholderTextColor="#9CA3AF"
          value={horticulture.lightRequirement || ''}
          onChangeText={(text) => updateHorticultureField('lightRequirement', text)}
        />
      </View>

      {/* Watering Frequency */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Watering Frequency</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Daily, 3x a week, Occasional etc."
          placeholderTextColor="#9CA3AF"
          value={horticulture.wateringFrequency || ''}
          onChangeText={(text) => updateHorticultureField('wateringFrequency', text)}
        />
      </View>

      {/* Season of Bloom/Growth */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Season of Bloom/Growth</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Blooms year-round"
          placeholderTextColor="#9CA3AF"
          value={horticulture.seasonOfBloomGrowth || ''}
          onChangeText={(text) => updateHorticultureField('seasonOfBloomGrowth', text)}
        />
      </View>

      {/* Fertilizer Recommendation */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Fertilizer Recommendation</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Apply NPK 15-15-15 monthly"
          placeholderTextColor="#9CA3AF"
          value={horticulture.fertilizerRecommendation || ''}
          onChangeText={(text) => updateHorticultureField('fertilizerRecommendation', text)}
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
          value={horticulture.quantityAvailable || ''}
          onChangeText={(text) => updateHorticultureField('quantityAvailable', text)}
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
});