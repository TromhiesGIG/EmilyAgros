// src/components/forms/CustomDatePicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons'; // Using Feather for the icon

interface CustomDatePickerProps {
  label: string;
  value: string; // The date string from the form state
  placeholder: string;
  onChange: (dateString: string) => void;
  required?: boolean;
}

// Helper to format the date
const formatDate = (date: Date): string => {
  // Formats to YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  placeholder,
  onChange,
  required = false,
}) => {
  // Use the 'value' prop to initialize the date, or default to today
  const [date, setDate] = useState(value ? new Date(value) : new Date());
  const [show, setShow] = useState(false);

  const onChangePicker = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    // Android closes the picker automatically. On iOS, we need to keep it open
    // until the user confirms.
    const currentDate = selectedDate || date;

    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set') {
        // 'set' means user pressed "OK"
        setDate(currentDate);
        onChange(formatDate(currentDate));
      }
      // 'dismissed' means user pressed "Cancel" or tapped outside
    } else {
      // On iOS, the picker is always visible in the modal,
      // so we just update the temp state.
      setDate(currentDate);
    }
  };

  const onConfirmIOS = () => {
    setShow(false);
    onChange(formatDate(date));
  };

  const onCancelIOS = () => {
    setShow(false);
    // Reset date to original value if canceled
    setDate(value ? new Date(value) : new Date());
  };

  // Determine button text and color
  const displayText = value ? formatDate(new Date(value)) : placeholder;
  const textColor = value ? styles.valueText : styles.placeholderText;

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>

      {/* The button that opens the picker */}
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text style={textColor}>{displayText}</Text>
        <Feather name="calendar" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Modal for Android and iOS */}
      <Modal
        visible={show}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShow(false)}
      >
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalContent}>
            {/* On iOS, show confirm/cancel buttons */}
            {Platform.OS === 'ios' && (
              <View style={styles.iosHeader}>
                <TouchableOpacity onPress={onCancelIOS}>
                  <Text style={styles.iosButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.iosHeaderTitle}>Pick a Date</Text>
                <TouchableOpacity onPress={onConfirmIOS}>
                  <Text style={styles.iosButton}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}

            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onChangePicker}
              style={styles.datePicker}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
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
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    height: 58, // Fixed height to match inputs
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  valueText: {
    color: '#111827',
    fontSize: 16,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  datePicker: {
    width: '100%',
    // On iOS, 'inline' display has its own height
    // On Android, 'default' (calendar) will size itself
  },
  // iOS specific header in modal
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iosHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  iosButton: {
    fontSize: 16,
    color: '#00A651',
  },
});