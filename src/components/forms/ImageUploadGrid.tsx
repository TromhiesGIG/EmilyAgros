import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons'; // Assuming you have @expo/vector-icons

interface ImageUploadGridProps {
  images: string[]; // Array of local URIs
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploadGrid: React.FC<ImageUploadGridProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
}) => {
  const pickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    // Ask for choice
    Alert.alert(
      'Upload Photo',
      'Choose a source',
      [
        {
          text: 'Camera',
          onPress: launchCamera,
        },
        {
          text: 'Gallery',
          onPress: launchGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const launchGallery = async () => {
    // 1. Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need camera roll permissions to upload images.');
      return;
    }

    // 2. Launch picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Client-side compression as requested in handoff
    });

    // 3. Handle result
    handleImageResult(result);
  };

  const launchCamera = async () => {
    // 1. Request permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need camera permissions to take photos.');
      return;
    }

    // 2. Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    // 3. Handle result
    handleImageResult(result);
  };

  const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUri = result.assets[0].uri;
      
      // File size validation (Note: result.assets[0].fileSize is in bytes)
      const fileSizeInMB = result.assets[0].fileSize ? result.assets[0].fileSize / 1024 / 1024 : 0;
      if (fileSizeInMB > 5) {
        Alert.alert('File Too Large', 'The selected image must be less than 5MB.');
        return;
      }
      
      // Add to existing images
      onImagesChange([...images, newUri]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedImages = images.filter((_, index) => index !== indexToRemove);
            onImagesChange(updatedImages);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Product Images</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {/* Upload Button (shows if images < maxImages) */}
        {images.length < maxImages && (
          <TouchableOpacity 
            style={[styles.imageContainer, styles.uploadButton]} 
            onPress={pickImage} 
            activeOpacity={0.7}
          >
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        )}

        {/* Image Previews */}
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.thumbnail} />
            
            {/* Remove Button */}
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => removeImage(index)}
            >
              <Feather name="x" size={14} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Title Picture Indicator (First Image) */}
            {index === 0 && (
              <View style={styles.titleBadge}>
                <Text style={styles.titleBadgeText}>Title Picture</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Text style={styles.helperText}>
        First picture is the title picture. Upload a maximum of {maxImages} images. Each one should not exceed 5Mb
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  uploadButton: {
    backgroundColor: '#D1FAE5', // Original green upload box color
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 40,
    color: '#00A651',
    fontWeight: '300',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  titleBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 166, 81, 0.9)', // Green from design
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  titleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 16,
  },
});