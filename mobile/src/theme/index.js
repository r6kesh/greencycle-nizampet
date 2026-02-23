// GreenCycle Premium Theme — Dark Green + Gold
export const COLORS = {
    // Primary
    primary: '#10B981',
    primaryDark: '#0D4B3C',
    primaryLight: '#34D399',
    primarySoft: 'rgba(16, 185, 129, 0.12)',

    // Gold Accent
    gold: '#C5A55A',
    goldLight: '#FBBF24',
    goldSoft: 'rgba(197, 165, 90, 0.12)',

    // Background
    bgPrimary: '#0A0F0D',
    bgSecondary: '#111916',
    bgCard: '#151D19',
    bgCardHover: '#1A2520',
    bgInput: '#1A2520',

    // Text
    textPrimary: '#F0FDF4',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textLight: '#CBD5E1',

    // Borders
    border: '#1E3A2F',
    borderLight: '#2D4A3E',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',

    // Others
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.6)',
};

export const FONTS = {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    // Fallbacks
    system: 'System',
};

export const SIZES = {
    // Spacing
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,

    // Font sizes
    fontXs: 10,
    fontSm: 12,
    fontMd: 14,
    fontBase: 16,
    fontLg: 18,
    fontXl: 22,
    fontXxl: 28,
    fontHero: 36,

    // Border radius
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 20,
    radiusFull: 999,

    // Screen Width
    screenPadding: 20,
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    glow: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
};

// Category icons mapping
export const CATEGORY_ICONS = {
    'Newspaper': { icon: '📰', color: '#F59E0B' },
    'Cardboard': { icon: '📦', color: '#D97706' },
    'Plastic': { icon: '🧴', color: '#3B82F6' },
    'Iron': { icon: '⚙️', color: '#6B7280' },
    'Steel': { icon: '🔩', color: '#9CA3AF' },
    'Aluminium': { icon: '🥫', color: '#E5E7EB' },
    'Copper': { icon: '🔶', color: '#B45309' },
    'E-Waste': { icon: '💻', color: '#10B981' },
    'Others': { icon: '♻️', color: '#8B5CF6' },
};
