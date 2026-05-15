// src/screens/categories/CategoryProductsScreen.tsx - FIXED NAVIGATION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft, Search as SearchIcon, Grid3x3, List } from 'lucide-react-native';
import { HomeStackParamList } from '../../navigation/types';
import { ProductCard } from '../../components/ProductCard';
import { SearchBar } from '../../components/search/SearchBar';
import { FilterChip } from '../../components/search/FilterChip';
import { SortDropdown } from '../../components/search/SortDropdown';
import { FilterModal } from '../../components/search/FilterModal';
import { attributesService } from '../../services/attributesService';
import { 
  FilterAttribute, 
  ProductFilters, 
  SortOption,
  ActiveFilters 
} from '../../types/attributes';

type CategoryProductsScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'CategoryProducts'>;
  route: RouteProp<HomeStackParamList, 'CategoryProducts'>;
};

export const CategoryProductsScreen: React.FC<CategoryProductsScreenProps> = ({
  navigation,
  route,
}) => {
  const { categoryId, categoryName, subcategoryId, subcategoryName } = route.params;

  // State
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSearch, setShowSearch] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [availableFilters, setAvailableFilters] = useState<FilterAttribute[]>([]);
  
  // Modal state
  const [selectedFilter, setSelectedFilter] = useState<FilterAttribute | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Load filters for this category
  useEffect(() => {
    loadFilters();
  }, [categoryId]);

  // Load products whenever filters change
  useEffect(() => {
    loadProducts();
  }, [categoryId, subcategoryId, searchQuery, sortBy, activeFilters]);

  const loadFilters = async () => {
    try {
      const filters = await attributesService.getAttributeDefinitionsForCategory(categoryId);
      setAvailableFilters(filters);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      const filters: ProductFilters = {
        category_id: categoryId,
        subcategory_id: subcategoryId,
        search: searchQuery || undefined,
        sort_by: sortBy,
        attributes: activeFilters,
      };

      const results = await attributesService.searchProducts(filters);
      setProducts(results);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleFilterPress = (filter: FilterAttribute) => {
    setSelectedFilter(filter);
    setShowFilterModal(true);
  };

  const handleApplyFilter = (filterName: string, value: any) => {
    if (value === undefined || value === null || value === '') {
      // Remove filter
      const newFilters = { ...activeFilters };
      delete newFilters[filterName];
      setActiveFilters(newFilters);
    } else {
      // Add/update filter
      setActiveFilters({
        ...activeFilters,
        [filterName]: value,
      });
    }
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length + (searchQuery ? 1 : 0);
  };

  const isFilterActive = (filterName: string) => {
    return activeFilters.hasOwnProperty(filterName);
  };

  const renderHeader = () => (
    <View>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {subcategoryName || categoryName}
        </Text>

        <View style={styles.topBarActions}>
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)}
            style={styles.iconButton}
          >
            <SearchIcon size={24} color="#111827" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={styles.iconButton}
          >
            {viewMode === 'grid' ? (
              <List size={24} color="#111827" />
            ) : (
              <Grid3x3 size={24} color="#111827" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for breeds, sellers"
            fullScreen
          />
        </View>
      )}

      {/* Filter Chips */}
      {availableFilters.length > 0 && (
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={availableFilters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FilterChip
                label={item.attribute_label}
                isActive={isFilterActive(item.attribute_name)}
                onPress={() => handleFilterPress(item)}
              />
            )}
            contentContainerStyle={styles.filtersList}
          />
        </View>
      )}

      {/* Results Count & Sort */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsCount}>
          {loading ? 'Loading...' : `Found ${products.length} ${searchQuery ? `results for ${searchQuery}` : 'ads'}`}
        </Text>

        <SortDropdown value={sortBy} onChange={setSortBy} />
      </View>

      {/* Active Filters Indicator */}
      {getActiveFilterCount() > 0 && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersText}>
            {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} active
          </Text>
          <TouchableOpacity onPress={handleClearAllFilters}>
            <Text style={styles.clearFiltersButton}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateTitle}>
          No {subcategoryName || categoryName} found!
        </Text>
        <Text style={styles.emptyStateSubtitle}>
          Try adjusting your filters or search
        </Text>
        {getActiveFilterCount() > 0 && (
          <TouchableOpacity onPress={handleClearAllFilters}>
            <Text style={styles.clearFiltersLink}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008102" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            viewMode={viewMode}
            onPress={() =>
              navigation.navigate('AdDetails', { adId: item.id })
            }
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#008102']}
            tintColor="#008102"
          />
        }
      />

      {/* Filter Modal */}
      {selectedFilter && (
        <FilterModal
          visible={showFilterModal}
          onClose={() => {
            setShowFilterModal(false);
            setSelectedFilter(null);
          }}
          filter={selectedFilter}
          currentValue={activeFilters[selectedFilter.attribute_name]}
          onApply={(value) => handleApplyFilter(selectedFilter.attribute_name, value)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 16,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  searchContainer: {
    paddingVertical: 8,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filtersList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  activeFiltersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0FDF4',
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#047857',
  },
  clearFiltersButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008102',
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  clearFiltersLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008102',
    textDecorationLine: 'underline',
  },
});