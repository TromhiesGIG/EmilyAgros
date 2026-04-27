// src/screens/main/LeaveReviewScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

const MAX_IMAGES = 5;
const MAX_CHARACTERS = 1000;

export const LeaveReviewScreen = ({ route, navigation }: any) => {
  const { sellerId, sellerName } = route.params;
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handlePickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit Reached', `You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImages([...images, uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
      const filePath = `review-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to leave a review.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please share your experience.');
      return;
    }

    setUploading(true);

    try {
      // Upload images to Supabase storage
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        const uploadPromises = images.map(uri => uploadImageToSupabase(uri));
        const results = await Promise.all(uploadPromises);
        uploadedImageUrls = results.filter(url => url !== null) as string[];
      }

      // Insert review into database
      const { error } = await supabase.from('reviews').insert({
        reviewer_id: user.id,
        seller_id: sellerId,
        rating,
        comment: comment.trim(),
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
      });

      if (error) throw error;

      Alert.alert('Success', 'Your review has been submitted!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            style={styles.starButton}
          >
            <Star
              size={40}
              fill={star <= rating ? '#F59E0B' : 'none'}
              color={star <= rating ? '#F59E0B' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave review</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Rate your experience with{'\n'}
            {sellerName}
          </Text>
          {renderStars()}
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Experience<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share your experience"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            maxLength={MAX_CHARACTERS}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {comment.length}/{MAX_CHARACTERS}
          </Text>
        </View>

        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Attach pictures</Text>
          
          <View style={styles.imagesGrid}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < MAX_IMAGES && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handlePickImage}
              >
                <Plus size={32} color="#00A651" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.imageHint}>
            Upload a maximum of {MAX_IMAGES} images. Each one should not exceed 5Mb
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || !comment.trim() || uploading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || !comment.trim() || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit my feedback</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1FAE5',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHint: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#00A651',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});