// src/components/Carousel.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, ScrollView, StyleSheet, Dimensions,
  NativeSyntheticEvent, NativeScrollEvent,
  Image, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/supabase';

const { width }      = Dimensions.get('window');
const SLIDE_WIDTH    = width - 32;
const SLIDE_INTERVAL = SLIDE_WIDTH + 16;

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&q=80&w=1482',
  'https://images.unsplash.com/photo-1578863766533-08c8fe4cc688?auto=format&fit=crop&q=80&w=1470',
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1470',
];

interface SlideItem {
  id: string;
  imageUrl: string;
  type: 'promotion' | 'announcement' | 'fallback';
  productId?: string;
}

interface Props {
  onAdPress?: (productId: string) => void;
}

export const Carousel: React.FC<Props> = ({ onAdPress }) => {
  const [slides, setSlides]           = useState<SlideItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef                 = useRef<ScrollView>(null);

  useEffect(() => { fetchCarouselSlots(); }, []);

  const fetchCarouselSlots = async () => {
    try {
      // Step 1: fetch slots (no join)
      const { data: slots, error } = await supabase
        .from('carousel_slots')
        .select('id, slot_number, slot_type, product_id, announcement_image_url, announcement_title, announcement_link')
        .order('slot_number', { ascending: true });

      if (error) throw error;

      const realSlides: SlideItem[] = [];

      for (const slot of (slots ?? [])) {
        if (slot.slot_type === 'promotion' && slot.product_id) {
          // Step 2: fetch product separately
          const { data: product } = await supabase
            .from('products')
            .select('images')
            .eq('id', slot.product_id)
            .single();

          if (product?.images?.[0]) {
            realSlides.push({
              id:        slot.id,
              imageUrl:  product.images[0],
              type:      'promotion',
              productId: slot.product_id,
            });
          }
        } else if (slot.slot_type === 'announcement' && slot.announcement_image_url) {
          realSlides.push({
            id:       slot.id,
            imageUrl: slot.announcement_image_url,
            type:     'announcement',
          });
        }
      }

      // Fall back to placeholder images if no real slides
      if (realSlides.length === 0) {
        setSlides(FALLBACK_IMAGES.map((url, i) => ({
          id: `fallback_${i}`, imageUrl: url, type: 'fallback',
        })));
      } else {
        setSlides(realSlides);
      }
    } catch (e) {
      console.error('Carousel fetch error:', e);
      setSlides(FALLBACK_IMAGES.map((url, i) => ({
        id: `fallback_${i}`, imageUrl: url, type: 'fallback',
      })));
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      const next = activeSlide === slides.length - 1 ? 0 : activeSlide + 1;
      scrollViewRef.current?.scrollTo({ x: next * SLIDE_INTERVAL, animated: true });
      setActiveSlide(next);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlide, slides.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SLIDE_INTERVAL);
    if (index !== activeSlide) setActiveSlide(index);
  };

  const handleSlidePress = (slide: SlideItem) => {
    if (slide.type === 'promotion' && slide.productId && onAdPress) {
      onAdPress(slide.productId);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#008102" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={SLIDE_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {slides.map((slide) => (
          <TouchableOpacity
            key={slide.id}
            activeOpacity={slide.type === 'fallback' ? 1 : 0.9}
            onPress={() => handleSlidePress(slide)}
            disabled={slide.type === 'fallback'}
          >
            <Image
              source={{ uri: slide.imageUrl }}
              style={styles.slide}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View key={index} style={[styles.dot, activeSlide === index && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:        { marginBottom: 16 },
  loadingContainer: { height: 166, justifyContent: 'center', alignItems: 'center' },
  scrollContent:    { paddingHorizontal: 16 },
  slide:            { width: SLIDE_WIDTH, height: 150, borderRadius: 12, marginRight: 16, backgroundColor: '#E5E7EB' },
  dotsContainer:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  dot:              { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB', marginHorizontal: 4 },
  activeDot:        { backgroundColor: '#00A651', width: 24 },
});