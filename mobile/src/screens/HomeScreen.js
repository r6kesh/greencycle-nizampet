import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
    Dimensions, Linking, Alert, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { COLORS, SIZES, CATEGORY_ICONS } from '../theme';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [businessInfo, setBusinessInfo] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [catRes, bizRes] = await Promise.all([
                api.getCategories(),
                api.getBusinessInfo()
            ]);
            setCategories(catRes.data || []);
            setBusinessInfo(bizRes.data);
        } catch (err) {
            console.error(err);
        }
        setRefreshing(false);
    };

    const callBusiness = () => {
        const phone = businessInfo?.phone || '+919876543210';
        Linking.openURL(`tel:${phone}`);
    };

    const whatsappBusiness = () => {
        const phone = (businessInfo?.whatsapp || '+919876543210').replace('+', '');
        const message = encodeURIComponent('Hi! I would like to book a scrap pickup.');
        Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`).catch(() => {
            Alert.alert('Error', 'WhatsApp is not installed');
        });
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.name || 'there'} 👋</Text>
                    <Text style={styles.subtitle}>Sell your scrap at best prices</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
                    <View style={styles.notifDot} />
                </TouchableOpacity>
            </View>

            {/* Hero Card */}
            <TouchableOpacity
                style={styles.heroCard}
                onPress={() => navigation.navigate('BookPickup')}
                activeOpacity={0.9}
            >
                <View style={styles.heroContent}>
                    <Text style={styles.heroEmoji}>📦</Text>
                    <View style={styles.heroText}>
                        <Text style={styles.heroTitle}>Book a Pickup</Text>
                        <Text style={styles.heroSubtitle}>Free doorstep collection</Text>
                    </View>
                </View>
                <View style={styles.heroBtn}>
                    <Text style={styles.heroBtnText}>Book Now →</Text>
                </View>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickBtn} onPress={callBusiness}>
                    <View style={[styles.quickIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                        <Ionicons name="call" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.quickLabel}>Call Now</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickBtn} onPress={whatsappBusiness}>
                    <View style={[styles.quickIcon, { backgroundColor: 'rgba(37,211,102,0.12)' }]}>
                        <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                    </View>
                    <Text style={styles.quickLabel}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Prices')}>
                    <View style={[styles.quickIcon, { backgroundColor: COLORS.goldSoft }]}>
                        <Ionicons name="pricetag" size={20} color={COLORS.gold} />
                    </View>
                    <Text style={styles.quickLabel}>Price List</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Bookings')}>
                    <View style={[styles.quickIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                        <Ionicons name="time" size={20} color={COLORS.info} />
                    </View>
                    <Text style={styles.quickLabel}>History</Text>
                </TouchableOpacity>
            </View>

            {/* Categories Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Scrap Categories</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Prices')}>
                    <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.categoryGrid}>
                {categories.slice(0, 6).map((cat) => {
                    const catIcon = CATEGORY_ICONS[cat.name] || { icon: cat.icon, color: COLORS.primary };
                    return (
                        <TouchableOpacity key={cat._id} style={styles.categoryCard} activeOpacity={0.8}>
                            <View style={[styles.categoryIcon, { backgroundColor: `${catIcon.color}15` }]}>
                                <Text style={styles.categoryEmoji}>{catIcon.icon}</Text>
                            </View>
                            <Text style={styles.categoryName}>{cat.name}</Text>
                            <Text style={styles.categoryPrice}>₹{cat.pricePerKg}/{cat.unit}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Live Prices */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📊 Today's Prices</Text>
            </View>

            <View style={styles.pricesCard}>
                {categories.map((cat) => (
                    <View key={cat._id} style={styles.priceRow}>
                        <View style={styles.priceLeft}>
                            <Text style={styles.priceEmoji}>{cat.icon}</Text>
                            <Text style={styles.priceName}>{cat.name}</Text>
                        </View>
                        <Text style={styles.priceValue}>₹{cat.pricePerKg}<Text style={styles.priceUnit}>/{cat.unit}</Text></Text>
                    </View>
                ))}
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Text style={styles.infoEmoji}>🏆</Text>
                <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Earn Loyalty Points!</Text>
                    <Text style={styles.infoText}>Get 1 point for every ₹10 worth of scrap sold. Redeem points for exciting rewards.</Text>
                </View>
            </View>

            <View style={{ height: 20 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.screenPadding,
        paddingTop: 56,
        paddingBottom: 16,
    },
    greeting: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    notifBtn: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    notifDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.danger,
    },
    heroCard: {
        marginHorizontal: SIZES.screenPadding,
        marginBottom: 24,
        backgroundColor: COLORS.primaryDark,
        borderRadius: SIZES.radiusXl,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroEmoji: {
        fontSize: 40,
        marginRight: 16,
    },
    heroText: {},
    heroTitle: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    heroSubtitle: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    heroBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusMd,
        paddingVertical: 14,
        alignItems: 'center',
    },
    heroBtnText: {
        color: COLORS.white,
        fontSize: SIZES.fontBase,
        fontWeight: '700',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: SIZES.screenPadding,
        marginBottom: 28,
    },
    quickBtn: {
        alignItems: 'center',
    },
    quickIcon: {
        width: 52,
        height: 52,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    quickLabel: {
        fontSize: SIZES.fontXs,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.screenPadding,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    seeAll: {
        color: COLORS.primary,
        fontSize: SIZES.fontSm,
        fontWeight: '600',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SIZES.screenPadding - 4,
        marginBottom: 24,
    },
    categoryCard: {
        width: (width - SIZES.screenPadding * 2 - 16) / 3,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: 14,
        alignItems: 'center',
        margin: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusSm,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryEmoji: {
        fontSize: 22,
    },
    categoryName: {
        fontSize: SIZES.fontXs,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginBottom: 2,
    },
    categoryPrice: {
        fontSize: SIZES.fontSm,
        color: COLORS.primary,
        fontWeight: '700',
    },
    pricesCard: {
        marginHorizontal: SIZES.screenPadding,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 24,
        overflow: 'hidden',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    priceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    priceEmoji: {
        fontSize: 20,
    },
    priceName: {
        fontSize: SIZES.fontMd,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    priceValue: {
        fontSize: SIZES.fontBase,
        color: COLORS.primary,
        fontWeight: '700',
    },
    priceUnit: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
        fontWeight: '400',
    },
    infoBanner: {
        marginHorizontal: SIZES.screenPadding,
        backgroundColor: COLORS.goldSoft,
        borderRadius: SIZES.radiusLg,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderWidth: 1,
        borderColor: COLORS.gold + '30',
    },
    infoEmoji: {
        fontSize: 32,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        color: COLORS.gold,
        marginBottom: 4,
    },
    infoText: {
        fontSize: SIZES.fontXs,
        color: COLORS.textSecondary,
        lineHeight: 16,
    },
});
