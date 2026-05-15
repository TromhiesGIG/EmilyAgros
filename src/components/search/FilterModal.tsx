// src/components/search/FilterModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { X } from 'lucide-react-native';
import { FilterAttribute } from '../../types/attributes';
import { PrimaryButton } from '../auth/PrimaryButton';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filter: FilterAttribute;
  currentValue?: string | number | string[] | boolean;
  onApply: (value: any) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filter,
  currentValue,
  onApply,
}) => {
  const [selectedValue, setSelectedValue] = useState<any>(currentValue);

  useEffect(() => {
    setSelectedValue(currentValue);
  }, [currentValue, visible]);

  const handleApply = () => {
    onApply(selectedValue);
    onClose();
  };

  const handleClear = () => {
    setSelectedValue(undefined);
  };

  const renderFilterContent = () => {
    switch (filter.attribute_type) {
      case 'select':
        return (
          <ScrollView style={styles.optionsList}>
            {filter.options?.map((option, index) => {
              const isSelected = selectedValue === option.value;
              
              return (
                <TouchableOpacity
                  key={`${option.value}-${index}`}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => setSelectedValue(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      case 'text':
        return (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={filter.placeholder || `Enter ${filter.attribute_label.toLowerCase()}`}
              value={selectedValue || ''}
              onChangeText={setSelectedValue}
              autoCorrect={false}
            />
          </View>
        );

      case 'number':
        return (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={filter.placeholder || `Enter ${filter.attribute_label.toLowerCase()}`}
              value={selectedValue?.toString() || ''}
              onChangeText={(text) => setSelectedValue(text ? parseInt(text) : undefined)}
              keyboardType="number-pad"
            />
          </View>
        );

      case 'range':
        // TODO: Implement range slider
        return (
          <View style={styles.textInputContainer}>
            <Text style={styles.comingSoon}>Range filter coming soon</Text>
          </View>
        );

      case 'boolean':
        return (
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={[styles.option, selectedValue === true && styles.optionSelected]}
              onPress={() => setSelectedValue(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, selectedValue === true && styles.radioSelected]}>
                {selectedValue === true && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.optionText, selectedValue === true && styles.optionTextSelected]}>
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, selectedValue === false && styles.optionSelected]}
              onPress={() => setSelectedValue(false)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, selectedValue === false && styles.radioSelected]}>
                {selectedValue === false && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.optionText, selectedValue === false && styles.optionTextSelected]}>
                No
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{filter.attribute_label}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {renderFilterContent()}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>

            <View style={styles.applyButtonContainer}>
              <PrimaryButton title="Apply Filter" onPress={handleApply} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  optionsList: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  optionSelected: {
    backgroundColor: '#F0FDF4',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#008102',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#008102',
  },
  optionText: {
    fontSize: 16,
    color: '#4B5563',
  },
  optionTextSelected: {
    color: '#008102',
    fontWeight: '600',
  },
  textInputContainer: {
    padding: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  comingSoon: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButtonContainer: {
    flex: 1,
  },
});