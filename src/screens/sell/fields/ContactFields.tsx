// src/screens/sell/fields/ContactFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData } from '../../../types/sellForm';

interface ContactFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const ContactFields: React.FC<ContactFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <>
      {/* Name */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Bambo Temidire"
          placeholderTextColor="#9CA3AF"
          value={formData.contact.name}
          onChangeText={(text) =>
            updateFormData({
              contact: { ...formData.contact, name: text },
            })
          }
        />
      </View>

      {/* Business/Farm Name */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Business/Farm Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter business name"
          placeholderTextColor="#9CA3AF"
          value={formData.contact.businessName}
          onChangeText={(text) =>
            updateFormData({
              contact: { ...formData.contact, businessName: text },
            })
          }
        />
      </View>

      {/* Phone Number */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Phone number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          placeholderTextColor="#9CA3AF"
          value={formData.contact.phone}
          onChangeText={(text) =>
            updateFormData({
              contact: { ...formData.contact, phone: text },
            })
          }
          keyboardType="phone-pad"
        />
      </View>

      {/* Available on Whatsapp? */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Available on Whatsapp?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() =>
              updateFormData({
                contact: { ...formData.contact, availableOnWhatsapp: true },
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {formData.contact.availableOnWhatsapp && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() =>
              updateFormData({
                contact: { ...formData.contact, availableOnWhatsapp: false },
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {!formData.contact.availableOnWhatsapp && (
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#111827',
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