// src/components/search/FilterChip.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onPress: () => void;
  count?: number;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isActive = false,
  onPress,
  count,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.containerActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {label}
        {count !== undefined && count > 0 && ` (${count})`}
      </Text>
      <ChevronDown 
        size={16} 
        color={isActive ? '#008102' : '#6B7280'} 
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  containerActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#008102',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginRight: 4,
  },
  labelActive: {
    color: '#008102',
  },
  icon: {
    marginLeft: 2,
  },
});