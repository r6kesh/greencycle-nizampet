import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';

const STATUS_CONFIG = {
    pending: { color: '#F59E0B', icon: 'time', label: 'Pending' },
    confirmed: { color: '#3B82F6', icon: 'checkmark-circle', label: 'Confirmed' },
    assigned: { color: '#A78BFA', icon: 'person', label: 'Agent Assigned' },
    out_for_pickup: { color: '#10B981', icon: 'car', label: 'On The Way' },
    completed: { color: '#34D399', icon: 'checkmark-done-circle', label: 'Completed' },
    cancelled: { color: '#EF4444', icon: 'close-circle', label: 'Cancelled' },
};

export default function BookingHistoryScreen({ navigation }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadBookings();
    }, [filter]);

    const loadBookings = async () => {
        try {
            const params = {};
            if (filter !== 'all') params.status = filter;
            const res = await api.getMyBookings(params);
            setBookings(res.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
        setRefreshing(false);
    };

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Active' },
        { key: 'completed', label: 'Done' },
        { key: 'cancelled', label: 'Cancelled' },
    ];

    const renderBooking = ({ item }) => {
        const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const items = (item.items || []).map(i => i.categoryName).join(', ');

        return (
            <TouchableOpacity
                style={styles.bookingCard}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id })}
                activeOpacity={0.7}
            >
                <View style={styles.bookingHeader}>
                    <Text style={styles.bookingId}>#{item.bookingId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                        <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                </View>

                <Text style={styles.bookingItems}>{items}</Text>

                <View style={styles.bookingMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                        <Text style={styles.metaText}>{new Date(item.scheduledDate).toLocaleDateString('en-IN')}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                        <Text style={styles.metaText}>{item.timeSlot}</Text>
                    </View>
                    <Text style={styles.bookingAmount}>₹{item.finalAmount || item.estimatedAmount}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📋 My Bookings</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                {filters.map(f => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={bookings}
                renderItem={renderBooking}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBookings(); }} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyTitle}>No bookings yet</Text>
                        <Text style={styles.emptyText}>Book your first scrap pickup today!</Text>
                    </View>
                }
            />
        </View>
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
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.screenPadding,
        marginBottom: 16,
        gap: 6,
    },
    filterBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterBtnActive: {
        backgroundColor: COLORS.primarySoft,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    filterTextActive: {
        color: COLORS.primary,
    },
    list: {
        paddingHorizontal: SIZES.screenPadding,
        paddingBottom: 20,
    },
    bookingCard: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    bookingId: {
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        color: COLORS.primary,
        fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: SIZES.radiusFull,
    },
    statusText: {
        fontSize: SIZES.fontXs,
        fontWeight: '600',
    },
    bookingItems: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginBottom: 10,
    },
    bookingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
    },
    bookingAmount: {
        marginLeft: 'auto',
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        color: COLORS.gold,
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: SIZES.fontBase,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
    },
});
