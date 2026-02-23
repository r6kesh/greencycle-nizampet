import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';

const STATUS_STEPS = ['pending', 'confirmed', 'assigned', 'out_for_pickup', 'completed'];
const STATUS_LABELS = {
    pending: 'Booking Placed',
    confirmed: 'Confirmed',
    assigned: 'Agent Assigned',
    out_for_pickup: 'On The Way',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function BookingDetailScreen({ route, navigation }) {
    const { bookingId } = route.params;
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBooking();
    }, []);

    const loadBooking = async () => {
        try {
            const res = await api.getBooking(bookingId);
            setBooking(res.data);
        } catch (err) {
            Alert.alert('Error', err.message);
        }
        setLoading(false);
    };

    const cancelBooking = async () => {
        Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, Cancel', style: 'destructive',
                onPress: async () => {
                    try {
                        await api.cancelBooking(bookingId, 'Cancelled by customer');
                        Alert.alert('Cancelled', 'Your booking has been cancelled');
                        loadBooking();
                    } catch (err) {
                        Alert.alert('Error', err.message);
                    }
                }
            }
        ]);
    };

    if (loading || !booking) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: COLORS.textMuted }}>Loading...</Text>
            </View>
        );
    }

    const currentStepIndex = STATUS_STEPS.indexOf(booking.status);

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topTitle}>Booking Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Booking ID & Status */}
                <View style={styles.idCard}>
                    <Text style={styles.bookingIdText}>#{booking.bookingId}</Text>
                    <Text style={styles.dateText}>{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </View>

                {/* Status Tracker */}
                {booking.status !== 'cancelled' && (
                    <View style={styles.trackerCard}>
                        <Text style={styles.sectionTitle}>📍 Pickup Status</Text>
                        {STATUS_STEPS.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            return (
                                <View key={step} style={styles.trackerStep}>
                                    <View style={styles.trackerDotCol}>
                                        <View style={[styles.trackerDot, isCompleted && styles.trackerDotActive, isCurrent && styles.trackerDotCurrent]} >
                                            {isCompleted && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                                        </View>
                                        {index < STATUS_STEPS.length - 1 && (
                                            <View style={[styles.trackerLine, isCompleted && styles.trackerLineActive]} />
                                        )}
                                    </View>
                                    <View style={styles.trackerLabel}>
                                        <Text style={[styles.trackerText, isCompleted && styles.trackerTextActive]}>
                                            {STATUS_LABELS[step]}
                                        </Text>
                                        {isCurrent && <Text style={styles.trackerCurrent}>Current</Text>}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {booking.status === 'cancelled' && (
                    <View style={[styles.trackerCard, { borderColor: COLORS.danger + '30' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                            <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>Booking Cancelled</Text>
                        </View>
                        {booking.cancelReason && <Text style={styles.cancelReason}>{booking.cancelReason}</Text>}
                    </View>
                )}

                {/* Items */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>📦 Items</Text>
                    {(booking.items || []).map((item, i) => (
                        <View key={i} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.categoryName}</Text>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.itemWeight}>{item.actualWeight || item.estimatedWeight} kg</Text>
                                <Text style={styles.itemAmount}>₹{item.amount || (item.pricePerKg * item.estimatedWeight)}</Text>
                            </View>
                        </View>
                    ))}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>{booking.status === 'completed' ? 'Final Amount' : 'Estimated Amount'}</Text>
                        <Text style={styles.totalValue}>₹{booking.finalAmount || booking.estimatedAmount}</Text>
                    </View>
                </View>

                {/* Address */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>📍 Pickup Address</Text>
                    <Text style={styles.addressText}>{booking.address?.fullAddress}</Text>
                    {booking.address?.landmark && <Text style={styles.landmarkText}>Landmark: {booking.address.landmark}</Text>}
                </View>

                {/* Schedule */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>📅 Schedule</Text>
                    <View style={styles.scheduleRow}>
                        <View style={styles.scheduleItem}>
                            <Ionicons name="calendar" size={16} color={COLORS.primary} />
                            <Text style={styles.scheduleText}>{new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                        </View>
                        <View style={styles.scheduleItem}>
                            <Ionicons name="time" size={16} color={COLORS.gold} />
                            <Text style={styles.scheduleText}>{booking.timeSlot}</Text>
                        </View>
                    </View>
                </View>

                {/* Agent Info */}
                {booking.agent && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>🚛 Agent</Text>
                        <View style={styles.agentRow}>
                            <View style={styles.agentAvatar}>
                                <Text style={{ fontSize: 20 }}>🚛</Text>
                            </View>
                            <View>
                                <Text style={styles.agentName}>{booking.agent.name}</Text>
                                <Text style={styles.agentPhone}>{booking.agent.phone}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Payment */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>💳 Payment</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Method</Text>
                        <Text style={styles.infoValue}>{booking.paymentMethod === 'cash' ? 'Cash on Pickup' : 'UPI/Online'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <Text style={[styles.infoValue, { color: booking.paymentStatus === 'completed' ? COLORS.success : COLORS.warning }]}>
                            {booking.paymentStatus}
                        </Text>
                    </View>
                </View>

                {/* Cancel Button */}
                {['pending', 'confirmed'].includes(booking.status) && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={cancelBooking}>
                        <Ionicons name="close-circle-outline" size={18} color={COLORS.danger} />
                        <Text style={styles.cancelText}>Cancel Booking</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.screenPadding,
        paddingTop: 50,
        paddingBottom: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    topTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    idCard: {
        marginHorizontal: SIZES.screenPadding,
        backgroundColor: COLORS.primaryDark,
        borderRadius: SIZES.radiusLg,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
        alignItems: 'center',
    },
    bookingIdText: {
        fontSize: SIZES.fontXl,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: 1,
    },
    dateText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    card: {
        marginHorizontal: SIZES.screenPadding,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    trackerCard: {
        marginHorizontal: SIZES.screenPadding,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    trackerStep: {
        flexDirection: 'row',
        minHeight: 40,
    },
    trackerDotCol: {
        alignItems: 'center',
        width: 28,
        marginRight: 12,
    },
    trackerDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.bgInput,
        borderWidth: 2,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackerDotActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    trackerDotCurrent: {
        borderColor: COLORS.gold,
        borderWidth: 3,
    },
    trackerLine: {
        width: 2,
        flex: 1,
        backgroundColor: COLORS.border,
    },
    trackerLineActive: {
        backgroundColor: COLORS.primary,
    },
    trackerLabel: {
        paddingBottom: 16,
        flex: 1,
    },
    trackerText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    trackerTextActive: {
        color: COLORS.textPrimary,
    },
    trackerCurrent: {
        fontSize: SIZES.fontXs,
        color: COLORS.gold,
        fontWeight: '600',
        marginTop: 2,
    },
    cancelReason: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
        marginTop: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    itemName: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
    },
    itemWeight: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
    },
    itemAmount: {
        fontSize: SIZES.fontMd,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        marginTop: 4,
    },
    totalLabel: {
        fontSize: SIZES.fontMd,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: SIZES.fontLg,
        fontWeight: '800',
        color: COLORS.primary,
    },
    addressText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    landmarkText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    scheduleRow: {
        flexDirection: 'row',
        gap: 24,
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    scheduleText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    agentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    agentAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    agentName: {
        fontSize: SIZES.fontBase,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    agentPhone: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
    },
    infoValue: {
        fontSize: SIZES.fontSm,
        color: COLORS.textPrimary,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    cancelBtn: {
        marginHorizontal: SIZES.screenPadding,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.danger + '30',
        backgroundColor: COLORS.danger + '10',
        marginBottom: 20,
    },
    cancelText: {
        color: COLORS.danger,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
});
