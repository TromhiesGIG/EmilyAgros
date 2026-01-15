// src/screens/sell/fields/ServiceFields.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SellFormData, ServiceFields as ServiceFieldsType } from '../../../types/sellForm';
import { CustomDropdown } from '../../../components/forms/CustomDropdown';
import { DROPDOWN_OPTIONS } from '../../../data/categoryConfig';

interface ServiceFieldsProps {
  formData: SellFormData;
  updateFormData: (updates: Partial<SellFormData>) => void;
}

export const ServiceFields: React.FC<ServiceFieldsProps> = ({
  formData,
  updateFormData,
}) => {
  const service = formData.service || {
    serviceType: '',
    yearsOfExperience: '',
    pricingBasis: '',
    modeOfDelivery: 'onsite',
  };

  const updateServiceField = (field: keyof ServiceFieldsType, value: any) => {
    updateFormData({
      service: { ...service, [field]: value },
    });
  };

  return (
    <>
      {/* Supporting Documents (Optional) */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Supporting Documents (Optional)</Text>
        <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7}>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>
          Service Brochure or Portfolio PDF
        </Text>
      </View>

      {/* Service Type - Dropdown */}
      <CustomDropdown
        label="Service Type"
        value={service.serviceType || ''}
        options={DROPDOWN_OPTIONS.serviceType}
        placeholder="Select service type"
        onChange={(value) => updateServiceField('serviceType', value)}
      />

      {/* Years of Experience - Dropdown */}
      <CustomDropdown
        label="Years of Experience"
        value={service.yearsOfExperience || ''}
        options={DROPDOWN_OPTIONS.yearsOfExperience}
        placeholder="Select experience range"
        onChange={(value) => updateServiceField('yearsOfExperience', value)}
      />

      {/* Mode of Delivery - Radio */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Mode of Delivery</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateServiceField('modeOfDelivery', 'onsite')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {service.modeOfDelivery === 'onsite' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Onsite</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateServiceField('modeOfDelivery', 'remote')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {service.modeOfDelivery === 'remote' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Remote</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateServiceField('modeOfDelivery', 'customer')}
            activeOpacity={0.7}
          >
            <View style={styles.radioCircle}>
              {service.modeOfDelivery === 'customer' && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <Text style={styles.radioLabel}>Customer's</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Fee */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Service Fee (₦)<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="E.g ₦5,000 per visit/hour/day"
          placeholderTextColor="#9CA3AF"
          value={service.serviceFee || ''}
          onChangeText={(text) => updateServiceField('serviceFee', text)}
          keyboardType="numeric"
        />
      </View>

      {/* Pricing Basis - Dropdown */}
      <CustomDropdown
        label="Pricing Basis"
        value={service.pricingBasis || ''}
        options={DROPDOWN_OPTIONS.pricingBasis}
        placeholder="Select pricing basis"
        onChange={(value) => updateServiceField('pricingBasis', value)}
      />

      {/* Availability Schedule */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Availability Schedule</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Mon - Sat, 8AM - 6PM"
          placeholderTextColor="#9CA3AF"
          value={service.availabilitySchedule || ''}
          onChangeText={(text) => updateServiceField('availabilitySchedule', text)}
        />
      </View>

      {/* Service Coverage Area */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Service Coverage Area</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Asanso, Frosso, Delta"
          placeholderTextColor="#9CA3AF"
          value={service.serviceCoverageArea || ''}
          onChangeText={(text) => updateServiceField('serviceCoverageArea', text)}
        />
      </View>

      {/* Duration Estimate */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Duration Estimate</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Mon - Sat, 8AM - 6PM"
          placeholderTextColor="#9CA3AF"
          value={service.durationEstimate || ''}
          onChangeText={(text) => updateServiceField('durationEstimate', text)}
        />
      </View>

      {/* Specialization */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Specialization</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g ₦25,000 per visit/hour/day"
          placeholderTextColor="#9CA3AF"
          value={service.specialization || ''}
          onChangeText={(text) => updateServiceField('specialization', text)}
        />
      </View>

      {/* Tools or Equipment Provided */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Tools or Equipment Provided</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Veterinary Kit, Tractor, Harvester"
          placeholderTextColor="#9CA3AF"
          value={service.toolsEquipmentProvided || ''}
          onChangeText={(text) => updateServiceField('toolsEquipmentProvided', text)}
        />
      </View>

      {/* Required Inputs */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Required Inputs</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g Veterinary Kit, Tractor, Harvester"
          placeholderTextColor="#9CA3AF"
          value={service.requiredInputs || ''}
          onChangeText={(text) => updateServiceField('requiredInputs', text)}
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
  uploadBox: {
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