import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES } from '../theme';

export default function SplashScreen() {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.5);

    useEffect(() => {
        console.log('--- SplashScreen Mounted ---');
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>♻️</Text>
                </View>
                <Text style={styles.brandName}>GreenCycle</Text>
                <Text style={styles.tagline}>Premium Scrap Services</Text>
            </Animated.View>
            <Animated.Text style={[styles.bottomText, { opacity: fadeAnim }]}>
                ♻️ Sell Your Scrap Smartly
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 30,
        backgroundColor: COLORS.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    iconEmoji: {
        fontSize: 48,
    },
    brandName: {
        fontSize: SIZES.fontHero,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: -1,
    },
    tagline: {
        fontSize: SIZES.fontMd,
        color: COLORS.gold,
        marginTop: 6,
        fontWeight: '500',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    bottomText: {
        position: 'absolute',
        bottom: 50,
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
    },
});
