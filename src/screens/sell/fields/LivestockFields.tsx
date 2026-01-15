// src/screens/sell/fields/LivestockFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData, LivestockFields as LivestockFieldsType } from '../../../types/sellForm';
import { CustomDropdown } from '../../../components/forms/CustomDropdown';
import { DROPDOWN_OPTIONS, LIVESTOCK_BREEDS } from '../../../data/categoryConfig';
import { CustomDatePicker } from '../../../components/forms/CustomDatePicker'; // 1. IMPORTED

interface LivestockFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const LivestockFields: React.FC<LivestockFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const livestock = formData.livestock || {
    breed: '',
    gender: 'male' as 'male' | 'female',
    age: '',
    dateOfBirth: '',
    color: '',
    size: '',
    registered: false,
    healthCondition: {
      vaccinated: false,
      dewormed: false,
      spayedNeutered: false,
    },
    healthNotes: '',
    featuresTraits: {
      temperament: '',
      specialTraits: '',
      trainingLevel: '',
    },
    availableFrom: '',
    deliveryAvailable: false,
  };

  const updateLivestockField = (field: keyof LivestockFieldsType, value: any) => {
    updateFormData({
      livestock: { ...livestock, [field]: value } as LivestockFieldsType,
    });
  };

  // Get breeds based on selected subcategory
  const getBreedOptions = () => {
    // Note: This relies on formData.subcategoryName being 'Dogs', 'Cats', etc.
    // The guide uses subcategoryName, but subcategorySlug might be more robust if available.
    // Following guide's logic:
    const subcategoryKey = formData.subcategoryName?.toLowerCase().replace(/ /g, '_').replace(/\//g, '-');
    return (subcategoryKey && LIVESTOCK_BREEDS[subcategoryKey]) ? LIVESTOCK_BREEDS[subcategoryKey] : [];
  };

  return (
    <>
      {/* Breed - DYNAMIC DROPDOWN */}
      <CustomDropdown
        label="Breed"
        value={livestock.breed || ''}
        options={getBreedOptions()}
        placeholder="Select breed"
        onChange={(value) => updateLivestockField('breed', value)}
        required
      />

      {/* Gender */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateLivestockField('gender', 'male')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.gender === 'male' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateLivestockField('gender', 'female')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.gender === 'female' && <View style={styles.radioSelected} />}
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
          placeholder="E.g 2 years and 3 months"
          placeholderTextColor="#9CA3AF"
          value={livestock.age || ''}
          onChangeText={(text) => updateLivestockField('age', text)}
        />
      </View>

      {/* 2. REPLACED Date of Birth */}
      <CustomDatePicker
        label="Date of Birth"
        value={livestock.dateOfBirth || ''}
        placeholder="Select date"
        onChange={(value) => updateLivestockField('dateOfBirth', value)}
      />

      {/* Color */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Color</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g White-Grey"
          placeholderTextColor="#9CA3AF"
          value={livestock.color || ''}
          onChangeText={(text) => updateLivestockField('color', text)}
        />
      </View>

      {/* Size */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Size</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Medium"
          placeholderTextColor="#9CA3AF"
          value={livestock.size || ''}
          onChangeText={(text) => updateLivestockField('size', text)}
        />
      </View>

      {/* Registered */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Registered</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateLivestockField('registered', true)}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.registered && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateLivestockField('registered', false)}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.registered === false && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Health Condition Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health & Condition</Text>
      </View>

      {/* Vaccinated */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Vaccinated</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() =>
              updateLivestockField('healthCondition', {
                ...livestock.healthCondition,
                vaccinated: true,
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.healthCondition.vaccinated && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() =>
              updateLivestockField('healthCondition', {
                ...livestock.healthCondition,
                vaccinated: false,
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.healthCondition.vaccinated === false && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dewormed */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Dewormed</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() =>
              updateLivestockField('healthCondition', {
                ...livestock.healthCondition,
                dewormed: true,
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.healthCondition.dewormed && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() =>
              updateLivestockField('healthCondition', {
                ...livestock.healthCondition,
                dewormed: false,
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.healthCondition.dewormed === false && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Spayed/Neutered */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Spayed/Neutered</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() =>
              updateLivestockField('healthCondition', {
                ...livestock.healthCondition,
                spayedNeutered: true,
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.healthCondition.spayedNeutered && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() =>
              updateLivestockField('healthCondition', {
                ...livestock.healthCondition,
                spayedNeutered: false,
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.healthCondition.spayedNeutered === false && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Health Notes */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Health Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder="E.g No known illness, or allergies"
          placeholderTextColor="#9CA3AF"
          value={livestock.healthNotes || ''}
          onChangeText={(text) => updateLivestockField('healthNotes', text)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Features & Traits Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Features & Traits</Text>
      </View>

      {/* Temperament */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Temperament</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Calm/Aggressive/Friendly/Playful"
          placeholderTextColor="#9CA3AF"
          value={livestock.featuresTraits.temperament || ''}
          onChangeText={(text) =>
            updateLivestockField('featuresTraits', {
              ...livestock.featuresTraits,
              temperament: text,
            })
          }
        />
      </View>

      {/* Special Traits */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Special Traits</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Good with kids, trained"
          placeholderTextColor="#9CA3AF"
          value={livestock.featuresTraits.specialTraits || ''}
          onChangeText={(text) =>
            updateLivestockField('featuresTraits', {
              ...livestock.featuresTraits,
              specialTraits: text,
            })
          }
        />
      </View>

      {/* Training Level */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Training level</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Untrained/Basic/Advanced"
          placeholderTextColor="#9CA3AF"
          value={livestock.featuresTraits.trainingLevel || ''}
          onChangeText={(text) =>
            updateLivestockField('featuresTraits', {
              ...livestock.featuresTraits,
              trainingLevel: text,
            })
          }
        />
      </View>

      {/* Available From */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Available From</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g 1 day, 1 week, 2 weeks"
          placeholderTextColor="#9CA3AF"
          value={livestock.availableFrom || ''}
          onChangeText={(text) => updateLivestockField('availableFrom', text)}
        />
      </View>

      {/* Delivery Available */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Delivery Available</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateLivestockField('deliveryAvailable', true)}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.deliveryAvailable && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateLivestockField('deliveryAvailable', false)}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {livestock.deliveryAvailable === false && (
                <View style={styles.radioSelected} />
              )}
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