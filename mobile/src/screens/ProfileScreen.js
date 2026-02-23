import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
    const { user, logout, setUser } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const saveProfile = async () => {
        try {
            const res = await api.updateProfile({ name, email });
            setUser(res.data);
            setEditing(false);
            Alert.alert('Success', 'Profile updated!');
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout }
        ]);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>👤 Profile</Text>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.userName}>{user?.name || 'Set your name'}</Text>
                <Text style={styles.userPhone}>{user?.phone}</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{user?.totalPickups || 0}</Text>
                        <Text style={styles.statLabel}>Pickups</Text>
                    </View>
                    <View style={[styles.statItem, styles.statBorder]}>
                        <Text style={[styles.statValue, { color: COLORS.gold }]}>{user?.loyaltyPoints || 0}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>₹{user?.totalEarnings || 0}</Text>
                        <Text style={styles.statLabel}>Earned</Text>
                    </View>
                </View>
            </View>

            {/* Edit Profile */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Personal Info</Text>
                    <TouchableOpacity onPress={() => editing ? saveProfile() : setEditing(true)}>
                        <Text style={styles.editBtn}>{editing ? '💾 Save' : '✏️ Edit'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.fieldCard}>
                    <View style={styles.field}>
                        <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
                        {editing ? (
                            <TextInput
                                style={styles.fieldInput}
                                value={name}
                                onChangeText={setName}
                                placeholder="Your name"
                                placeholderTextColor={COLORS.textMuted}
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{user?.name || 'Not set'}</Text>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.field}>
                        <Ionicons name="call-outline" size={18} color={COLORS.textMuted} />
                        <Text style={styles.fieldValue}>{user?.phone}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.field}>
                        <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
                        {editing ? (
                            <TextInput
                                style={styles.fieldInput}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email address"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="email-address"
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{user?.email || 'Not set'}</Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Addresses */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>📍 Saved Addresses</Text>
                </View>

                {(user?.addresses || []).length === 0 ? (
                    <View style={styles.emptyAddr}>
                        <Text style={styles.emptyText}>No addresses saved yet</Text>
                    </View>
                ) : (
                    user.addresses.map((addr, i) => (
                        <View key={i} style={styles.addrCard}>
                            <View style={styles.addrIcon}>
                                <Ionicons name={addr.label === 'Home' ? 'home' : 'business'} size={18} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.addrLabel}>{addr.label}</Text>
                                <Text style={styles.addrText}>{addr.fullAddress}</Text>
                            </View>
                            {addr.isDefault && (
                                <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultText}>Default</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>

            {/* Referral */}
            <View style={styles.referralCard}>
                <Text style={styles.referralEmoji}>🎁</Text>
                <View style={{ flex: 1 }}>
                    <Text style={styles.referralTitle}>Refer & Earn</Text>
                    <Text style={styles.referralText}>Share your code with friends & earn loyalty points!</Text>
                </View>
                <View style={styles.referralCodeBox}>
                    <Text style={styles.referralCode}>{user?.referralCode || 'N/A'}</Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                {[
                    { icon: 'notifications-outline', label: 'Notifications', action: () => navigation.navigate('Notifications') },
                    { icon: 'help-circle-outline', label: 'Help & Support', action: () => { } },
                    { icon: 'document-text-outline', label: 'Terms & Conditions', action: () => { } },
                    { icon: 'shield-checkmark-outline', label: 'Privacy Policy', action: () => { } },
                ].map((item, i) => (
                    <TouchableOpacity key={i} style={styles.menuItem} onPress={item.action}>
                        <Ionicons name={item.icon} size={20} color={COLORS.textSecondary} />
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.version}>GreenCycle v1.0.0</Text>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    header: {
        paddingHorizontal: SIZES.screenPadding,
        paddingTop: 56,
        paddingBottom: 12,
    },
    title: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    profileCard: {
        marginHorizontal: SIZES.screenPadding,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusXl,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: COLORS.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.primary,
    },
    userName: {
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    userPhone: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.border,
    },
    statValue: {
        fontSize: SIZES.fontLg,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: SIZES.screenPadding,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: SIZES.fontMd,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    editBtn: {
        fontSize: SIZES.fontSm,
        color: COLORS.primary,
        fontWeight: '600',
    },
    fieldCard: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 14,
    },
    fieldValue: {
        flex: 1,
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
    },
    fieldInput: {
        flex: 1,
        fontSize: SIZES.fontMd,
        color: COLORS.textPrimary,
        padding: 0,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: 46,
    },
    emptyAddr: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
    },
    addrCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: 14,
        marginBottom: 8,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    addrIcon: {
        width: 40,
        height: 40,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addrLabel: {
        fontSize: SIZES.fontSm,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    addrText: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    defaultBadge: {
        backgroundColor: COLORS.primarySoft,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: SIZES.radiusSm,
    },
    defaultText: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: '600',
    },
    referralCard: {
        marginHorizontal: SIZES.screenPadding,
        backgroundColor: COLORS.goldSoft,
        borderRadius: SIZES.radiusLg,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.gold + '30',
    },
    referralEmoji: {
        fontSize: 28,
    },
    referralTitle: {
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        color: COLORS.gold,
        marginBottom: 2,
    },
    referralText: {
        fontSize: SIZES.fontXs,
        color: COLORS.textSecondary,
    },
    referralCodeBox: {
        backgroundColor: COLORS.bgCard,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: SIZES.radiusSm,
        borderWidth: 1,
        borderColor: COLORS.gold + '30',
    },
    referralCode: {
        fontSize: SIZES.fontSm,
        fontWeight: '700',
        color: COLORS.gold,
        letterSpacing: 1,
    },
    menuSection: {
        marginHorizontal: SIZES.screenPadding,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuLabel: {
        flex: 1,
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    logoutBtn: {
        marginHorizontal: SIZES.screenPadding,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.danger + '30',
        backgroundColor: COLORS.danger + '08',
        marginBottom: 16,
    },
    logoutText: {
        color: COLORS.danger,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
        marginBottom: 10,
    },
});
