// src/components/Carousel.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, ScrollView, StyleSheet, Dimensions,
  NativeSyntheticEvent, NativeScrollEvent,
  Image, TouchableOpacity, ActivityIndicator, Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';

const { width }      = Dimensions.get('window');
const SLIDE_WIDTH    = width - 32;
const SLIDE_INTERVAL = SLIDE_WIDTH + 12;
const SLIDE_HEIGHT   = 180;

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
  title?: string;
  price?: number;
  location?: string;
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
      const { data: slots, error } = await supabase
        .from('carousel_slots')
        .select('id, slot_number, slot_type, product_id, announcement_image_url, announcement_title, announcement_link')
        .order('slot_number', { ascending: true });

      if (error) throw error;

      const realSlides: SlideItem[] = [];

      for (const slot of (slots ?? [])) {
        if (slot.slot_type === 'promotion' && slot.product_id) {
          const { data: product } = await supabase
            .from('products')
            .select('images, title, price, location_state')
            .eq('id', slot.product_id)
            .single();

          if (product?.images?.[0]) {
            realSlides.push({
              id:        slot.id,
              imageUrl:  product.images[0],
              type:      'promotion',
              productId: slot.product_id,
              title:     product.title,
              price:     product.price,
              location:  product.location_state,
            });
          }
        } else if (slot.slot_type === 'announcement' && slot.announcement_image_url) {
          realSlides.push({
            id:       slot.id,
            imageUrl: slot.announcement_image_url,
            type:     'announcement',
            title:    slot.announcement_title,
          });
        }
      }

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
            style={styles.slide}
            activeOpacity={slide.type === 'fallback' ? 1 : 0.95}
            onPress={() => handleSlidePress(slide)}
            disabled={slide.type === 'fallback'}
          >
            {/* Product/Announcement Image */}
            <Image
              source={{ uri: slide.imageUrl }}
              style={styles.slideImage}
              resizeMode="cover"
            />

            {/* Gradient overlay for text readability */}
            {slide.type !== 'fallback' && (
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.75)']}
                style={styles.gradient}
              >
                {/* Sponsored badge */}
                {slide.type === 'promotion' && (
                  <View style={styles.sponsoredBadge}>
                    <Text style={styles.sponsoredText}>Sponsored</Text>
                  </View>
                )}

                {/* Content */}
                <View style={styles.slideContent}>
                  {slide.title && (
                    <Text style={styles.slideTitle} numberOfLines={1}>
                      {slide.title}
                    </Text>
                  )}
                  {slide.type === 'promotion' && slide.price && (
                    <Text style={styles.slidePrice}>
                      ₦{Number(slide.price).toLocaleString()}
                      {slide.location ? `  •  ${slide.location}` : ''}
                    </Text>
                  )}
                  <View style={styles.ctaBtn}>
                    <Text style={styles.ctaText}>
                      {slide.type === 'promotion' ? 'View Ad →' : 'Learn More →'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeSlide === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:        { marginBottom: 16 },
  loadingContainer: { height: SLIDE_HEIGHT + 20, justifyContent: 'center', alignItems: 'center' },
  scrollContent:    { paddingHorizontal: 16 },
  slide:            {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  slideImage:     { width: '100%', height: '100%', position: 'absolute' },
  gradient:       { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', padding: 14, justifyContent: 'flex-end' },
  sponsoredBadge: { position: 'absolute', top: -90, left: 14, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  sponsoredText:  { color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  slideContent:   { gap: 4 },
  slideTitle:     { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  slidePrice:     { color: '#E5E7EB', fontSize: 13, fontWeight: '500' },
  ctaBtn:         { alignSelf: 'flex-start', backgroundColor: '#008102', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  ctaText:        { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  dotsContainer:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  dot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB', marginHorizontal: 3 },
  activeDot:      { backgroundColor: '#008102', width: 20, borderRadius: 3 },
});