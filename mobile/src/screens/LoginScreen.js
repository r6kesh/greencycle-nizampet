import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '../../App';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';

export default function LoginScreen() {
    const { login } = useContext(AuthContext);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // phone | otp
    const [loading, setLoading] = useState(false);

    const sendOTP = async () => {
        if (phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;
            const res = await api.sendOTP(fullPhone);

            // In development, auto-fill OTP
            if (res.otp) {
                setOtp(res.otp);
            }

            setStep('otp');
            Alert.alert('OTP Sent', 'Please enter the OTP sent to your phone');
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to send OTP');
        }
        setLoading(false);
    };

    const verifyOTP = async () => {
        if (otp.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;
            const res = await api.verifyOTP(fullPhone, otp);
            await login(res.data.user, res.data.token);
        } catch (err) {
            Alert.alert('Error', err.message || 'Invalid OTP');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoEmoji}>♻️</Text>
                    </View>
                    <Text style={styles.brandName}>GreenCycle</Text>
                    <Text style={styles.tagline}>Premium Scrap Services</Text>
                </View>

                {/* Form */}
                <View style={styles.formSection}>
                    <Text style={styles.formTitle}>
                        {step === 'phone' ? 'Enter your phone' : 'Verify OTP'}
                    </Text>
                    <Text style={styles.formSubtitle}>
                        {step === 'phone'
                            ? 'We\'ll send you a verification code'
                            : `OTP sent to +91${phone}`}
                    </Text>

                    {step === 'phone' ? (
                        <View style={styles.inputRow}>
                            <View style={styles.prefix}>
                                <Text style={styles.prefixText}>🇮🇳 +91</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Phone number"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                                maxLength={10}
                            />
                        </View>
                    ) : (
                        <View>
                            <TextInput
                                style={[styles.input, styles.otpInput]}
                                placeholder="Enter 6-digit OTP"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="number-pad"
                                value={otp}
                                onChangeText={setOtp}
                                maxLength={6}
                                textAlign="center"
                                letterSpacing={8}
                            />
                            <TouchableOpacity onPress={() => setStep('phone')} style={styles.changeBtn}>
                                <Text style={styles.changeText}>Change phone number</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.btn, loading && styles.btnDisabled]}
                        onPress={step === 'phone' ? sendOTP : verifyOTP}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.btnText}>
                            {loading ? '...' : step === 'phone' ? 'Send OTP' : 'Verify & Login'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.termsText}>
                    By continuing, you agree to our Terms of Service & Privacy Policy
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: SIZES.screenPadding,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: COLORS.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    logoEmoji: {
        fontSize: 36,
    },
    brandName: {
        fontSize: SIZES.fontXxl,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    tagline: {
        fontSize: SIZES.fontSm,
        color: COLORS.gold,
        marginTop: 4,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    formSection: {
        marginBottom: 32,
    },
    formTitle: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    formSubtitle: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    prefix: {
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRightWidth: 0,
        borderTopLeftRadius: SIZES.radiusMd,
        borderBottomLeftRadius: SIZES.radiusMd,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    prefixText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderTopRightRadius: SIZES.radiusMd,
        borderBottomRightRadius: SIZES.radiusMd,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: SIZES.fontLg,
        color: COLORS.textPrimary,
    },
    otpInput: {
        borderRadius: SIZES.radiusMd,
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    changeBtn: {
        paddingVertical: 8,
        marginBottom: 12,
    },
    changeText: {
        color: COLORS.primary,
        fontSize: SIZES.fontSm,
        fontWeight: '600',
    },
    btn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
    },
    btnDisabled: {
        opacity: 0.6,
    },
    btnText: {
        color: COLORS.white,
        fontSize: SIZES.fontBase,
        fontWeight: '700',
    },
    termsText: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: SIZES.fontXs,
        lineHeight: 16,
    },
});
