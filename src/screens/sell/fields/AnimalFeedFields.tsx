// src/screens/sell/fields/AnimalFeedFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData, AnimalFeedFields as AnimalFeedFieldsType } from '../../../types/sellForm';

interface AnimalFeedFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const AnimalFeedFields: React.FC<AnimalFeedFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const feed = formData.animalFeed || {};

  const updateFeedField = (field: keyof AnimalFeedFieldsType, value: any) => {
    updateFormData({
      animalFeed: { ...feed, [field]: value },
    });
  };

  return (
    <>
      {/* Feed Type - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Feed Type</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {feed.feedType || 'Select feed type'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Ingredients */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Ingredients</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Maize, Soybean meal, Bone meal"
          placeholderTextColor="#9CA3AF"
          value={feed.ingredients || ''}
          onChangeText={(text) => updateFeedField('ingredients', text)}
        />
      </View>

      {/* Feed Name */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Feed Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter feed name"
          placeholderTextColor="#9CA3AF"
          value={feed.feedName || ''}
          onChangeText={(text) => updateFeedField('feedName', text)}
        />
      </View>

      {/* Purpose/Stage - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Purpose/Stage</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {feed.purposeStage || 'Select feed stage'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Packaging Size */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Packaging Size</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 5kg, 10kg, 50kg etc."
          placeholderTextColor="#9CA3AF"
          value={feed.packagingSize || ''}
          onChangeText={(text) => updateFeedField('packagingSize', text)}
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
          value={feed.quantityAvailable || ''}
          onChangeText={(text) => updateFeedField('quantityAvailable', text)}
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