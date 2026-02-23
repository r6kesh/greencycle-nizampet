import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { COLORS, SIZES, CATEGORY_ICONS } from '../theme';
import api from '../services/api';

const TIME_SLOTS = ['8AM-10AM', '10AM-12PM', '12PM-2PM', '2PM-4PM', '4PM-6PM', '6PM-8PM'];

export default function BookPickupScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [step, setStep] = useState(1); // 1: items, 2: address, 3: schedule, 4: confirm
    const [categories, setCategories] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategories();
        // Pre-fill address
        if (user?.addresses?.length > 0) {
            const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
            setAddress(defaultAddr.fullAddress);
            setLandmark(defaultAddr.landmark || '');
        }
        // Default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
    }, []);

    const loadCategories = async () => {
        try {
            const res = await api.getCategories();
            setCategories(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleItem = (cat) => {
        const exists = selectedItems.find(i => i.category === cat._id);
        if (exists) {
            setSelectedItems(selectedItems.filter(i => i.category !== cat._id));
        } else {
            setSelectedItems([...selectedItems, { category: cat._id, categoryName: cat.name, estimatedWeight: 5, icon: cat.icon }]);
        }
    };

    const updateWeight = (catId, weight) => {
        setSelectedItems(selectedItems.map(i =>
            i.category === catId ? { ...i, estimatedWeight: parseInt(weight) || 0 } : i
        ));
    };

    const getEstimatedTotal = () => {
        return selectedItems.reduce((sum, item) => {
            const cat = categories.find(c => c._id === item.category);
            return sum + (cat ? cat.pricePerKg * item.estimatedWeight : 0);
        }, 0);
    };

    const handleBook = async () => {
        if (!address) { Alert.alert('Error', 'Please enter an address'); return; }
        if (!date) { Alert.alert('Error', 'Please select a date'); return; }
        if (!timeSlot) { Alert.alert('Error', 'Please select a time slot'); return; }
        if (selectedItems.length === 0) { Alert.alert('Error', 'Please select at least one item'); return; }

        setLoading(true);
        try {
            const bookingData = {
                items: selectedItems.map(i => ({ category: i.category, estimatedWeight: i.estimatedWeight })),
                address: { fullAddress: address, landmark, city: 'Nizampet' },
                scheduledDate: date,
                timeSlot,
                notes,
                paymentMethod
            };

            const res = await api.createBooking(bookingData);

            Alert.alert(
                '🎉 Booking Confirmed!',
                `Your pickup #${res.data.bookingId} has been booked.\nEstimated amount: ₹${getEstimatedTotal()}\nDate: ${date}\nTime: ${timeSlot}`,
                [{ text: 'View Bookings', onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }) }]
            );
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to create booking');
        }
        setLoading(false);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View>
                        <Text style={styles.stepTitle}>📦 Select Scrap Items</Text>
                        <Text style={styles.stepSubtitle}>Choose the types of scrap you want to sell</Text>

                        {categories.map(cat => {
                            const isSelected = selectedItems.find(i => i.category === cat._id);
                            const catIcon = CATEGORY_ICONS[cat.name] || { icon: cat.icon, color: COLORS.primary };
                            return (
                                <TouchableOpacity
                                    key={cat._id}
                                    style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                                    onPress={() => toggleItem(cat)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.itemIcon, { backgroundColor: `${catIcon.color}15` }]}>
                                        <Text style={{ fontSize: 24 }}>{catIcon.icon}</Text>
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName}>{cat.name}</Text>
                                        <Text style={styles.itemPrice}>₹{cat.pricePerKg}/{cat.unit}</Text>
                                    </View>
                                    {isSelected && (
                                        <View style={styles.weightInput}>
                                            <TextInput
                                                style={styles.weightField}
                                                value={String(isSelected.estimatedWeight)}
                                                onChangeText={(val) => updateWeight(cat._id, val)}
                                                keyboardType="number-pad"
                                                placeholder="KG"
                                                placeholderTextColor={COLORS.textMuted}
                                            />
                                            <Text style={styles.kgLabel}>kg</Text>
                                        </View>
                                    )}
                                    <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                                        {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );

            case 2:
                return (
                    <View>
                        <Text style={styles.stepTitle}>📍 Pickup Address</Text>
                        <Text style={styles.stepSubtitle}>Where should we come for pickup?</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Full Address *</Text>
                            <TextInput
                                style={[styles.formInput, { minHeight: 80, textAlignVertical: 'top' }]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="House/Flat No, Street, Area..."
                                placeholderTextColor={COLORS.textMuted}
                                multiline
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Landmark</Text>
                            <TextInput
                                style={styles.formInput}
                                value={landmark}
                                onChangeText={setLandmark}
                                placeholder="Near hospital, school, etc."
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        {user?.addresses?.length > 0 && (
                            <View>
                                <Text style={styles.formLabel}>Saved Addresses</Text>
                                {user.addresses.map((addr, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.savedAddr, address === addr.fullAddress && styles.savedAddrActive]}
                                        onPress={() => { setAddress(addr.fullAddress); setLandmark(addr.landmark || ''); }}
                                    >
                                        <Ionicons name="location" size={16} color={address === addr.fullAddress ? COLORS.primary : COLORS.textMuted} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.savedAddrLabel}>{addr.label}</Text>
                                            <Text style={styles.savedAddrText}>{addr.fullAddress}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                );

            case 3:
                return (
                    <View>
                        <Text style={styles.stepTitle}>📅 Schedule Pickup</Text>
                        <Text style={styles.stepSubtitle}>Choose your preferred date & time</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Pickup Date *</Text>
                            <TextInput
                                style={styles.formInput}
                                value={date}
                                onChangeText={setDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        <Text style={[styles.formLabel, { marginBottom: 12 }]}>Select Time Slot *</Text>
                        <View style={styles.slotsGrid}>
                            {TIME_SLOTS.map(slot => (
                                <TouchableOpacity
                                    key={slot}
                                    style={[styles.slotBtn, timeSlot === slot && styles.slotBtnActive]}
                                    onPress={() => setTimeSlot(slot)}
                                >
                                    <Text style={[styles.slotText, timeSlot === slot && styles.slotTextActive]}>{slot}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Additional Notes</Text>
                            <TextInput
                                style={[styles.formInput, { minHeight: 60, textAlignVertical: 'top' }]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Any special instructions..."
                                placeholderTextColor={COLORS.textMuted}
                                multiline
                            />
                        </View>

                        <Text style={[styles.formLabel, { marginBottom: 12 }]}>Payment Method</Text>
                        {['cash', 'upi'].map(method => (
                            <TouchableOpacity
                                key={method}
                                style={[styles.paymentBtn, paymentMethod === method && styles.paymentBtnActive]}
                                onPress={() => setPaymentMethod(method)}
                            >
                                <Ionicons
                                    name={method === 'cash' ? 'cash' : 'card'}
                                    size={20}
                                    color={paymentMethod === method ? COLORS.primary : COLORS.textMuted}
                                />
                                <Text style={[styles.paymentText, paymentMethod === method && { color: COLORS.primary }]}>
                                    {method === 'cash' ? 'Cash on Pickup' : 'UPI / Online Payment'}
                                </Text>
                                <View style={[styles.radioOuter, paymentMethod === method && styles.radioOuterActive]}>
                                    {paymentMethod === method && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 4:
                return (
                    <View>
                        <Text style={styles.stepTitle}>✅ Confirm Booking</Text>
                        <Text style={styles.stepSubtitle}>Review your pickup details</Text>

                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>📦 Items</Text>
                            {selectedItems.map((item, i) => {
                                const cat = categories.find(c => c._id === item.category);
                                return (
                                    <View key={i} style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>{item.categoryName} ({item.estimatedWeight}kg)</Text>
                                        <Text style={styles.summaryValue}>₹{cat ? cat.pricePerKg * item.estimatedWeight : 0}</Text>
                                    </View>
                                );
                            })}
                            <View style={[styles.summaryRow, styles.summaryTotal]}>
                                <Text style={styles.totalLabel}>Estimated Total</Text>
                                <Text style={styles.totalValue}>₹{getEstimatedTotal()}</Text>
                            </View>
                        </View>

                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>📍 Address</Text>
                            <Text style={styles.summaryText}>{address}</Text>
                            {landmark ? <Text style={styles.summarySubText}>Landmark: {landmark}</Text> : null}
                        </View>

                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>📅 Schedule</Text>
                            <Text style={styles.summaryText}>{date} • {timeSlot}</Text>
                            <Text style={styles.summarySubText}>Payment: {paymentMethod === 'cash' ? 'Cash on Pickup' : 'UPI/Online'}</Text>
                        </View>

                        {notes ? (
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>📝 Notes</Text>
                                <Text style={styles.summaryText}>{notes}</Text>
                            </View>
                        ) : null}
                    </View>
                );
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.container}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.topTitle}>Book Pickup</Text>
                    <Text style={styles.stepIndicator}>{step}/4</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
                </View>

                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {renderStep()}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Bottom Button */}
                <View style={styles.bottomBar}>
                    {step < 4 ? (
                        <TouchableOpacity
                            style={[styles.nextBtn, selectedItems.length === 0 && step === 1 && styles.nextBtnDisabled]}
                            onPress={() => setStep(step + 1)}
                            disabled={selectedItems.length === 0 && step === 1}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.nextBtnText}>Continue →</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.nextBtn, styles.confirmBtn, loading && { opacity: 0.6 }]}
                            onPress={handleBook}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.nextBtnText}>{loading ? 'Booking...' : '✓ Confirm Booking'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
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
    stepIndicator: {
        fontSize: SIZES.fontSm,
        color: COLORS.primary,
        fontWeight: '600',
        backgroundColor: COLORS.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: SIZES.radiusSm,
    },
    progressBar: {
        height: 3,
        backgroundColor: COLORS.border,
        marginHorizontal: SIZES.screenPadding,
        borderRadius: 2,
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: SIZES.screenPadding,
        paddingTop: 20,
    },
    stepTitle: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    stepSubtitle: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },
    // Items
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    itemCardSelected: {
        borderColor: COLORS.primary + '50',
        backgroundColor: COLORS.primarySoft,
    },
    itemIcon: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusSm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: SIZES.fontMd,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    itemPrice: {
        fontSize: SIZES.fontXs,
        color: COLORS.primary,
        marginTop: 2,
    },
    weightInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgInput,
        borderRadius: SIZES.radiusSm,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 10,
    },
    weightField: {
        width: 40,
        textAlign: 'center',
        color: COLORS.textPrimary,
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        paddingVertical: 6,
    },
    kgLabel: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
        paddingRight: 8,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkCircleActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    // Form
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: SIZES.fontMd,
        color: COLORS.textPrimary,
    },
    savedAddr: {
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
    savedAddrActive: {
        borderColor: COLORS.primary + '50',
    },
    savedAddrLabel: {
        fontSize: SIZES.fontSm,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    savedAddrText: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    // Time Slots
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    slotBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    slotBtnActive: {
        backgroundColor: COLORS.primarySoft,
        borderColor: COLORS.primary,
    },
    slotText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    slotTextActive: {
        color: COLORS.primary,
    },
    // Payment
    paymentBtn: {
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
    paymentBtnActive: {
        borderColor: COLORS.primary + '50',
    },
    paymentText: {
        flex: 1,
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterActive: {
        borderColor: COLORS.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    // Summary
    summaryCard: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    summaryTitle: {
        fontSize: SIZES.fontSm,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    summaryLabel: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: SIZES.fontSm,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    summaryTotal: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        marginTop: 8,
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: SIZES.fontLg,
        fontWeight: '800',
        color: COLORS.primary,
    },
    summaryText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textPrimary,
        lineHeight: 22,
    },
    summarySubText: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    // Bottom Bar
    bottomBar: {
        paddingHorizontal: SIZES.screenPadding,
        paddingVertical: 12,
        backgroundColor: COLORS.bgSecondary,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    nextBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusMd,
        paddingVertical: 16,
        alignItems: 'center',
    },
    nextBtnDisabled: {
        opacity: 0.4,
    },
    confirmBtn: {
        backgroundColor: COLORS.gold,
    },
    nextBtnText: {
        color: COLORS.white,
        fontSize: SIZES.fontBase,
        fontWeight: '700',
    },
});
