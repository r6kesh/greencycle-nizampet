import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Animated } from 'react-native';
import { COLORS, SIZES } from '../theme';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        emoji: '📦',
        title: 'Sell Your Scrap',
        subtitle: 'Turn your waste into cash! We collect newspaper, plastic, metal, e-waste and more at the best prices.',
        color: COLORS.primary,
    },
    {
        id: '2',
        emoji: '🚛',
        title: 'Doorstep Pickup',
        subtitle: 'Book a free pickup at your convenience. Our trained agents will come to your doorstep and collect your scrap.',
        color: COLORS.gold,
    },
    {
        id: '3',
        emoji: '💰',
        title: 'Get Paid Instantly',
        subtitle: 'Receive instant payment via UPI, cash, or bank transfer. Check live prices and earn loyalty points!',
        color: COLORS.primary,
    },
];

export default function OnboardingScreen({ onFinish }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const goNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            onFinish();
        }
    };

    const renderSlide = ({ item, index }) => (
        <View style={styles.slide}>
            <View style={[styles.emojiContainer, { borderColor: item.color }]}>
                <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Skip button */}
            <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                keyExtractor={(item) => item.id}
            />

            {/* Dots */}
            <View style={styles.dotsContainer}>
                {slides.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 24, 8],
                        extrapolate: 'clamp',
                    });
                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={i}
                            style={[styles.dot, { width: dotWidth, opacity, backgroundColor: COLORS.primary }]}
                        />
                    );
                })}
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.8}>
                <Text style={styles.nextBtnText}>
                    {currentIndex === slides.length - 1 ? 'Get Started 🚀' : 'Next →'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    skipBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    skipText: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emojiContainer: {
        width: 120,
        height: 120,
        borderRadius: 36,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 2,
    },
    emoji: {
        fontSize: 56,
    },
    title: {
        fontSize: SIZES.fontXxl,
        fontWeight: '800',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: SIZES.fontBase,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        gap: 6,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    nextBtn: {
        backgroundColor: COLORS.primary,
        marginHorizontal: 20,
        marginBottom: 40,
        paddingVertical: 16,
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
    },
    nextBtnText: {
        color: COLORS.white,
        fontSize: SIZES.fontBase,
        fontWeight: '700',
    },
});
