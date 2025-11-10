// src/screens/sell/fields/CommonFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData } from '../../../types/sellForm';

interface CommonFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const CommonFields: React.FC<CommonFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const descriptionMaxLength = 300;
  const descriptionLength = formData.description.length;

  return (
    <>
      {/* Product Title */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Product Title<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Premium Organic Rice - 50kg"
          placeholderTextColor="#9CA3AF"
          value={formData.productTitle}
          onChangeText={(text) => updateFormData({ productTitle: text })}
        />
      </View>

      {/* Description */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Description<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="Briefly describe your product"
          placeholderTextColor="#9CA3AF"
          value={formData.description}
          onChangeText={(text) => {
            if (text.length <= descriptionMaxLength) {
              updateFormData({ description: text });
            }
          }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>
          {descriptionLength}/{descriptionMaxLength}
        </Text>
      </View>

      {/* Product Images */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Product Images</Text>
        <TouchableOpacity style={styles.imageUploadBox} activeOpacity={0.7}>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>
          First picture is the title picture. Upload a maximum of 5 images. Each
          one should not exceed 5Mb
        </Text>
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
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  imageUploadBox: {
    width: 100,
    height: 100,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 40,
    color: '#00A651',
    fontWeight: '300',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 16,
  },
});