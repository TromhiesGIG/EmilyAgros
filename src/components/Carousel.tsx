import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Image } from 'react-native';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - 32;
const SLIDE_INTERVAL = SLIDE_WIDTH + 16; // Slide width + marginRight

export const Carousel: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Updated ad slots with Unsplash image URLs
  const adSlots = [
    { id: 1, imageUrl: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1482' },
    { id: 2, imageUrl: 'https://images.unsplash.com/photo-1578863766533-08c8fe4cc688?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470' },
    { id: 3, imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470' },
  ];

  // Auto-scroll logic
  useEffect(() => {
    const timer = setInterval(() => {
      // Calculate the next slide index
      const nextSlide = activeSlide === adSlots.length - 1 ? 0 : activeSlide + 1;
      
      // Scroll to the next slide
      scrollViewRef.current?.scrollTo({ 
        x: nextSlide * SLIDE_INTERVAL, 
        animated: true 
      });
      
      // Update the active slide state
      setActiveSlide(nextSlide);
    }, 5000); // 5 seconds

    // Clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, [activeSlide, adSlots.length]); // Re-run the effect when activeSlide changes

  // Update dots when user scrolls manually
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDE_INTERVAL);
    if (slideIndex !== activeSlide) {
      setActiveSlide(slideIndex);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled // This helps snap to the full scroll view width
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll} // Use onMomentumScrollEnd for efficiency
        scrollEventThrottle={16}
        snapToInterval={SLIDE_INTERVAL} // Snap to the width of one slide + margin
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {adSlots.map((slot) => (
          <Image
            key={slot.id}
            source={{ uri: slot.imageUrl }}
            style={styles.slide}
          />
        ))}
      </ScrollView>
      
      <View style={styles.dotsContainer}>
        {adSlots.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeSlide === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: 150,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#E5E7EB', // Added a background color for image loading
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#00A651',
    width: 24,
  },
});