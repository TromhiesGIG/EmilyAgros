// src/screens/main/PersonalInfo.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { ArrowLeft, X } from 'lucide-react-native';

export const PersonalInfo = ({ navigation }: any) => {
  // State for form fields
  const [firstName, setFirstName] = useState('Temidire');
  const [lastName, setLastName] = useState('Bambo');
  const [phone, setPhone] = useState('08012345678');
  
  // Track if any changes were made
  const [hasChanges, setHasChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Initial values for comparison
  const initialValues = { firstName: 'Temidire', lastName: 'Bambo', phone: '08012345678' };

  useEffect(() => {
    const changed = 
      firstName !== initialValues.firstName || 
      lastName !== initialValues.lastName || 
      phone !== initialValues.phone;
    setHasChanges(changed);
  }, [firstName, lastName, phone]);

  const handleBackPress = () => {
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      navigation.goBack();
    }
  };

  const handleSave = () => {
    // Implement Supabase update logic here
    console.log("Saving changes:", { firstName, lastName, phone });
    setHasChanges(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Info</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity onPress={() => console.log("Change photo pressed")}>
              <Text style={styles.changePhotoText}>Change photo</Text>
            </TouchableOpacity>
            <Text style={styles.photoHint}>JPG or PNG. Max size is 5MB</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First name</Text>
              <TextInput 
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last name</Text>
              <TextInput 
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput 
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="08012345678"
              />
            </View>
          </View>

          <View style={styles.footerInfo}>
            <Text style={styles.footerHint}>Your personal details are only visible to you.</Text>
            <TouchableOpacity 
              style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!hasChanges}
            >
              <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Discard Changes Modal */}
      <Modal
        visible={showDiscardModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Discard Changes</Text>
              <TouchableOpacity onPress={() => setShowDiscardModal(false)}>
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalMessage}>
              Are you sure you want to discard your changes?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonNo}
                onPress={() => setShowDiscardModal(false)}
              >
                <Text style={styles.modalButtonNoText}>No, I'm not</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonYes}
                onPress={() => {
                  setShowDiscardModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalButtonYesText}>Yes, I'm sure</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scrollContent: { padding: 20 },
  photoSection: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  changePhotoText: { fontSize: 16, color: '#008102', fontWeight: '600', textDecorationLine: 'underline' },
  photoHint: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  form: { marginBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 8 },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  footerInfo: { alignItems: 'center' },
  footerHint: { fontSize: 12, color: '#6B7280', marginBottom: 20 },
  saveButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#008102',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: { backgroundColor: '#E5E7EB' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  saveButtonTextDisabled: { color: '#9CA3AF' },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalMessage: { fontSize: 18, color: '#4B5563', textAlign: 'center', marginBottom: 32, lineHeight: 26 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButtonNo: { flex: 1, height: 56, backgroundColor: '#F9FAFB', borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  modalButtonNoText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  modalButtonYes: { flex: 1, height: 56, backgroundColor: '#EF4444', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  modalButtonYesText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});