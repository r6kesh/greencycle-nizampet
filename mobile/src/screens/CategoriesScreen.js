import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { COLORS, SIZES, CATEGORY_ICONS } from '../theme';
import api from '../services/api';

export default function CategoriesScreen() {
    const [categories, setCategories] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await api.getCategories();
            setCategories(res.data || []);
        } catch (err) {
            console.error(err);
        }
        setRefreshing(false);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCategories(); }} tintColor={COLORS.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>📊 Live Scrap Prices</Text>
                <Text style={styles.subtitle}>Updated daily • Best rates guaranteed</Text>
            </View>

            {/* Price Banner */}
            <View style={styles.banner}>
                <Text style={styles.bannerEmoji}>💰</Text>
                <Text style={styles.bannerText}>We offer the best prices in Nizampet area. Prices are updated daily based on market rates.</Text>
            </View>

            {categories.map((cat) => {
                const catIcon = CATEGORY_ICONS[cat.name] || { icon: cat.icon, color: COLORS.primary };
                return (
                    <View key={cat._id} style={styles.card}>
                        <View style={[styles.cardIcon, { backgroundColor: `${catIcon.color}15` }]}>
                            <Text style={styles.cardEmoji}>{catIcon.icon}</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardName}>{cat.name}</Text>
                            <Text style={styles.cardDesc}>{cat.description || 'Scrap material'}</Text>
                            {cat.minQuantity > 0 && (
                                <Text style={styles.cardMin}>Min: {cat.minQuantity} {cat.unit}</Text>
                            )}
                        </View>
                        <View style={styles.cardPrice}>
                            <Text style={styles.priceValue}>₹{cat.pricePerKg}</Text>
                            <Text style={styles.priceUnit}>per {cat.unit}</Text>
                        </View>
                    </View>
                );
            })}

            <View style={styles.note}>
                <Text style={styles.noteText}>ℹ️ Prices may vary based on quality and quantity. Final price is decided at the time of pickup.</Text>
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: SIZES.screenPadding,
        paddingTop: 56,
        paddingBottom: 20,
    },
    title: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
    },
    banner: {
        marginHorizontal: SIZES.screenPadding,
        backgroundColor: COLORS.primarySoft,
        borderRadius: SIZES.radiusMd,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.primary + '25',
    },
    bannerEmoji: {
        fontSize: 24,
    },
    bannerText: {
        flex: 1,
        fontSize: SIZES.fontXs,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    card: {
        marginHorizontal: SIZES.screenPadding,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardIcon: {
        width: 52,
        height: 52,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardEmoji: {
        fontSize: 26,
    },
    cardContent: {
        flex: 1,
    },
    cardName: {
        fontSize: SIZES.fontBase,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
    },
    cardMin: {
        fontSize: SIZES.fontXs,
        color: COLORS.gold,
        marginTop: 2,
    },
    cardPrice: {
        alignItems: 'flex-end',
    },
    priceValue: {
        fontSize: SIZES.fontXl,
        fontWeight: '800',
        color: COLORS.primary,
    },
    priceUnit: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
    },
    note: {
        marginHorizontal: SIZES.screenPadding,
        marginTop: 10,
        padding: 14,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    noteText: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
        lineHeight: 18,
    },
});
