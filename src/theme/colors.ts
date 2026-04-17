export const Colors = {
  // Backgrounds
  bg: '#0F0F0F',
  bgSecondary: '#1A1A1A',
  bgTertiary: '#222222',
  bgCard: '#1E1E1E',
  bgElevated: '#2A2A2A',
  bgInput: '#252525',
  bgModal: '#181818',

  // Borders
  border: '#333333',
  borderLight: '#2A2A2A',
  borderFocus: '#FF8C00',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#707070',
  textInverse: '#0F0F0F',

  // Primary (Naranja/Ámbar)
  primary: '#FF8C00',
  primaryLight: '#FFA033',
  primaryDark: '#CC7000',
  primaryBg: 'rgba(255, 140, 0, 0.12)',
  primaryBgStrong: 'rgba(255, 140, 0, 0.25)',

  // Success (Verde)
  success: '#4ADE80',
  successDark: '#22C55E',
  successBg: 'rgba(74, 222, 128, 0.12)',

  // Danger (Rojo)
  danger: '#F87171',
  dangerDark: '#EF4444',
  dangerBg: 'rgba(248, 113, 113, 0.12)',

  // Warning
  warning: '#FBBF24',
  warningBg: 'rgba(251, 191, 36, 0.12)',

  // Info
  info: '#60A5FA',
  infoBg: 'rgba(96, 165, 250, 0.12)',

  // Status colors
  statusPending: '#FBBF24',
  statusPreparing: '#60A5FA',
  statusReady: '#4ADE80',
  statusDelivered: '#A78BFA',
  statusCancelled: '#F87171',

  // Table status
  tableAvailable: '#4ADE80',
  tableOccupied: '#FF8C00',
  tableBill: '#F87171',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  white: '#FFFFFF',
  black: '#000000',
};

export const Shadows = {
  small: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
};
