import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';

const TYPE_ICONS = {
    booking_confirmed: '✅',
    booking_assigned: '🚛',
    out_for_pickup: '🏃',
    pickup_completed: '🎉',
    payment_received: '💰',
    promotional: '🔔',
    general: '📢',
};

export default function NotificationsScreen({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await api.getNotifications();
            setNotifications(res.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const markAsRead = async (id) => {
        try {
            await api.markNotificationRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            style={[styles.notifCard, !item.isRead && styles.notifUnread]}
            onPress={() => markAsRead(item._id)}
            activeOpacity={0.7}
        >
            <View style={styles.notifIcon}>
                <Text style={{ fontSize: 22 }}>{TYPE_ICONS[item.type] || '📢'}</Text>
            </View>
            <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody}>{item.body}</Text>
                <Text style={styles.notifTime}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                </Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>🔔 Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={item => item._id}
                contentContainerStyle={{ padding: SIZES.screenPadding, paddingBottom: 20 }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
                        <Text style={styles.emptyTitle}>No notifications</Text>
                        <Text style={styles.emptyText}>You're all caught up!</Text>
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
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    notifCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'flex-start',
    },
    notifUnread: {
        backgroundColor: COLORS.primarySoft,
        borderColor: COLORS.primary + '25',
    },
    notifIcon: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.bgInput,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notifContent: {
        flex: 1,
    },
    notifTitle: {
        fontSize: SIZES.fontMd,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    notifBody: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        lineHeight: 18,
        marginBottom: 6,
    },
    notifTime: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginTop: 6,
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: SIZES.fontBase,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    emptyText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
        marginTop: 4,
    },
});
