// src/screens/main/PersonalInfo.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Camera } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useSyncData } from '../../hooks/useSyncData';


export const PersonalInfo = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { refresh } = useSyncData();
  
  // Form State matched to your UI images
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bio: '',
    avatarUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone_number, bio, avatar_url')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      // Split "Temidire Bambo" back into two fields for the UI
      const nameParts = data.full_name?.split(' ') || ['', ''];
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phoneNumber: data.phone_number || '',
        bio: data.bio || '',
        avatarUrl: data.avatar_url || '',
      });
    }
    setLoading(false);
  };
  const uploadImage = async () => {
  // 1. Pick the image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
    base64: true,
  });

  if (!result.canceled && result.assets[0].base64) {
    setSaving(true);
    const fileName = `${user?.id}/${Date.now()}.png`;
    
    // 2. Upload to Supabase Storage Bucket named 'avatars'
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, decode(result.assets[0].base64), {
        contentType: 'image/png'
      });

    if (data) {
      // 3. Get Public URL and update local state
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      Alert.alert("Success", "Photo uploaded! Don't forget to save changes.");
      
    }
    setSaving(false);
  }
  
};

  const handleUpdate = async () => {
  if (!user) return;
  if (!formData.firstName.trim() || !formData.lastName.trim()) {
    Alert.alert('Error', 'First and Last names are required');
    return;
  }

  setSaving(true);
  
  const combinedName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

  console.log('🔄 Updating profile with:', { combinedName, avatarUrl: formData.avatarUrl });

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: combinedName,
      phone_number: formData.phoneNumber,
      bio: formData.bio,
      avatar_url: formData.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    setSaving(false);
    Alert.alert('Error', 'Update failed: ' + error.message);
  } else {
    console.log('✅ Profile updated in DB, now refreshing...');
    await refresh();
    console.log('✅ Refresh completed');
    setSaving(false);
    Alert.alert('Success', 'Profile updated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  }
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008102" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity onPress={handleUpdate} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#008102" /> : <Save size={24} color="#008102" />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* AVATAR SECTION - MATCHING YOUR IMAGE */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: formData.avatarUrl || 'https://via.placeholder.com/150' }} 
              style={styles.avatar} 
            />
          </View>
          <TouchableOpacity style={styles.changePhotoBtn} onPress={uploadImage}>
            {saving ? (
            <ActivityIndicator size="small" color="#008102" />
          ) : (
            <Text style={styles.changePhotoText}>Change photo</Text>
          )}
          </TouchableOpacity>
          <Text style={styles.sizeNote}>JPG or PNG. Max size is 5MB</Text>
        </View>

        {/* SPLIT NAME INPUTS */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First name</Text>
          <TextInput 
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => setFormData({...formData, firstName: text})}
            placeholder="e.g. Temidire"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last name</Text>
          <TextInput 
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => setFormData({...formData, lastName: text})}
            placeholder="e.g. Bambo"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput 
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
            placeholder="08012345678"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio (Optional)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(text) => setFormData({...formData, bio: text})}
            placeholder="Tell us about yourself..."
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, saving && styles.disabledBtn]} 
          onPress={handleUpdate}
          disabled={saving}
        >
          <Text style={styles.submitBtnText}>{saving ? 'Updating...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrapper: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', backgroundColor: '#F3F4F6', marginBottom: 12 },
  avatar: { width: '100%', height: '100%' },
  changePhotoBtn: { marginBottom: 4 },
  changePhotoText: { color: '#008102', fontWeight: '600', fontSize: 16 },
  sizeNote: { fontSize: 12, color: '#9CA3AF' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#008102', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabledBtn: { backgroundColor: '#A3E635' }
});