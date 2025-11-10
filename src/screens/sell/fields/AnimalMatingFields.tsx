// src/screens/sell/fields/AnimalMatingFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData, AnimalMatingFields as AnimalMatingFieldsType } from '../../../types/sellForm';

interface AnimalMatingFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const AnimalMatingFields: React.FC<AnimalMatingFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const mating = formData.animalMating || {};

  const updateMatingField = (field: keyof AnimalMatingFieldsType, value: any) => {
    updateFormData({
      animalMating: { ...mating, [field]: value },
    });
  };

  return (
    <>
      {/* Breed */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Breed</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Boer Goat, Rottweiler"
          placeholderTextColor="#9CA3AF"
          value={mating.breed || ''}
          onChangeText={(text) => updateMatingField('breed', text)}
        />
      </View>

      {/* Gender */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateMatingField('gender', 'male')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {mating.gender === 'male' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateMatingField('gender', 'female')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {mating.gender === 'female' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>Female</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Age */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 24 months or 2 years"
          placeholderTextColor="#9CA3AF"
          value={mating.age || ''}
          onChangeText={(text) => updateMatingField('age', text)}
        />
      </View>

      {/* Pedigree Status - Dropdown Placeholder */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Pedigree Status</Text>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonPlaceholder}>
            {mating.pedigreeStatus || 'Select pedigree'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Special Traits */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Special Traits</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g hornless, fast grower"
          placeholderTextColor="#9CA3AF"
          value={mating.specialTraits || ''}
          onChangeText={(text) => updateMatingField('specialTraits', text)}
        />
      </View>

      {/* Breeding History */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Breeding History</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateMatingField('breedingHistory', 'proven')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {mating.breedingHistory === 'proven' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Proven</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateMatingField('breedingHistory', 'first_time')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {mating.breedingHistory === 'first_time' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>First-Time</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateMatingField('breedingHistory', 'unknown')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {mating.breedingHistory === 'unknown' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Unknown</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fertility Tested */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Fertility Tested</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateMatingField('fertilityTested', true)}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {mating.fertilityTested && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateMatingField('fertilityTested', false)}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {mating.fertilityTested === false && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vaccination Status */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Vaccination Status</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateMatingField('vaccinationStatus', true)}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {mating.vaccinationStatus && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateMatingField('vaccinationStatus', false)}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {mating.vaccinationStatus === false && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Available For */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Available For</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 1 day, 1 week, 2 weeks"
          placeholderTextColor="#9CA3AF"
          value={mating.availableFor || ''}
          onChangeText={(text) => updateMatingField('availableFor', text)}
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
    gap: 16,
    flexWrap: 'wrap',
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