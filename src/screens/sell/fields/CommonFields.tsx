// src/screens/sell/fields/CommonFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData } from '../../../types/sellForm';
import { ImageUploadGrid } from '../../../components/forms/ImageUploadGrid'; // 1. IMPORT

interface CommonFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const CommonFields: React.FC<CommonFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const descriptionMaxLength = 300;
  // Ensure description is not null before checking length
  const descriptionLength = formData.description ? formData.description.length : 0;

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

      {/* 2. REPLACE Product Images placeholder */}
      <ImageUploadGrid
        images={formData.images || []}
        onImagesChange={(newImages) => updateFormData({ images: newImages })}
        maxImages={5}
      />
    </>
  );
};

// 3. REMOVED styles for imageUploadBox, plusIcon, helperText
//    (They are now inside ImageUploadGrid.tsx)
//    (Keeping the rest of the styles)
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
  // Note: imageUploadBox, plusIcon, and helperText styles are removed
  // as they are now encapsulated in ImageUploadGrid.tsx
});