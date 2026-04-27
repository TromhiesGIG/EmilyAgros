// src/components/forms/PreviewModal.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SellFormData } from '../../types/sellForm';
import { Category } from '../../navigation/types';
import { Feather } from '@expo/vector-icons';
// We'll use this to get the LGA label from its value
import { NIGERIAN_STATES, LGAS } from '../../data/nigerianLocations';

interface PreviewModalProps {
  visible: boolean;
  formData: SellFormData;
  category: Category | null;
  onClose: () => void; // For "Edit" button
  onPublish: () => void; // For "Publish" button
}

const { width } = Dimensions.get('window');


// Helper to find a label from a value in our dropdown options
const findLabel = (options: { label: string; value: string }[], value: string) => {
  return options.find(opt => opt.value === value)?.label || value;
};

// Helper component for a single preview field
const PreviewField: React.FC<{ label: string; value?: string | boolean | null }> = ({
  label,
  value,
}) => {
  if (!value) return null;

  let displayValue: string;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  } else {
    displayValue = value;
  }

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{displayValue}</Text>
    </View>
  );
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  visible,
  formData,
  category,
  onClose,
  onPublish,
}) => {
  if (!category) return null;

  const {
    productTitle,
    description,
    images,
    price,
    negotiable,
    location,
    contact,
  } = formData;

  // Get full location labels
  const stateLabel = findLabel(NIGERIAN_STATES, location.state);
  const lgaLabel = findLabel(LGAS[location.state] || [], location.lga);
  
  const renderCategoryFields = () => {
    switch (category.slug) {
      case 'tractors-farm-equipments':
        const eq = formData.equipment;
        return (
          <>
            <PreviewField label="Quantity" value={eq?.quantityAvailable} />
            <PreviewField label="Brand" value={eq?.brandManufacturer} />
            <PreviewField label="Condition" value={eq?.condition} />
            <PreviewField label="Power" value={eq?.power} />
            <PreviewField label="Fuel Type" value={eq?.fuelType} />
            <PreviewField label="Transmission" value={eq?.transmissionType} />
            <PreviewField label="Year" value={eq?.yearOfManufacture} />
            <PreviewField label="Hours of Use" value={eq?.hoursOfUse} />
            <PreviewField label="Status" value={eq?.functionalityStatus} />
            <PreviewField label="Availability" value={eq?.availability} />
            {eq?.availability === 'for_rent' && (
              <PreviewField label="Rental Rate" value={eq?.rentalRate} />
            )}
          </>
        );
      // TODO: Add cases for all other categories
      // This is just an example. You'd need to add one for each.
      case 'livestock-pets':
        const ls = formData.livestock;
        return (
          <>
            <PreviewField label="Breed" value={ls?.breed} />
            <PreviewField label="Gender" value={ls?.gender} />
            <PreviewField label="Age" value={ls?.age} />
            <PreviewField label="Date of Birth" value={ls?.dateOfBirth} />
            {/* You would continue this for all fields... */}
          </>
        );
      // Add other cases here...
      default:
        return <Text style={styles.fieldValue}>No specific details for this category.</Text>;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Feather name="x" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ad Preview</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Image (just show the first one) */}
          {images && images.length > 0 && (
            <Image source={{ uri: images[0] }} style={styles.mainImage} />
          )}

          {/* Title & Price */}
          <View style={styles.section}>
            <Text style={styles.title}>{productTitle}</Text>
            <Text style={styles.price}>₦{price}</Text>
            <Text style={styles.negotiable}>
              {negotiable ? '(Negotiable)' : '(Not Negotiable)'}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* Category Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <PreviewField label="Category" value={formData.categoryName} />
            {formData.subcategoryName && (
              <PreviewField label="Sub-Category" value={formData.subcategoryName} />
            )}
            {/* Render all the category-specific fields */}
            {renderCategoryFields()}
          </View>

          {/* Location & Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Contact</Text>
            <PreviewField label="Location" value={`${lgaLabel}, ${stateLabel}`} />
            <PreviewField label="Address" value={location.address} />
            <PreviewField label="Contact Name" value={contact.name} />
            <PreviewField label="Business Name" value={contact.businessName} />
            <PreviewField label="Phone" value={contact.phone} />
            <PreviewField label="WhatsApp" value={contact.availableOnWhatsapp} />
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.publishButton}
            onPress={onPublish}
            activeOpacity={0.8}
          >
            <Text style={styles.publishButtonText}>Publish Ad</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  mainImage: {
    width: width,
    height: width * 0.75, // 4:3 aspect ratio
    resizeMode: 'cover',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00A651',
  },
  negotiable: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#00A651',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  editButtonText: {
    color: '#00A651',
    fontSize: 16,
    fontWeight: 'bold',
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#00A651',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});