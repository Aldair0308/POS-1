import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';

// ==================== BUTTON ====================

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const bgColors = {
    primary: Colors.primary,
    secondary: Colors.bgElevated,
    danger: Colors.dangerDark,
    ghost: 'transparent',
    success: Colors.successDark,
  };

  const textColors = {
    primary: Colors.textInverse,
    secondary: Colors.text,
    danger: Colors.white,
    ghost: Colors.primary,
    success: Colors.white,
  };

  const heights = { sm: 36, md: 48, lg: 56 };
  const fontSizes = { sm: 13, md: 15, lg: 17 };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? Colors.bgTertiary : bgColors[variant],
          height: heights[size],
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: Colors.primary,
        },
        fullWidth && { width: '100%' },
        variant === 'primary' && !disabled && Shadows.glow(Colors.primary),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon ? <Text style={[styles.buttonIcon, { fontSize: fontSizes[size] + 2 }]}>{icon}</Text> : null}
          <Text
            style={[
              styles.buttonText,
              {
                color: disabled ? Colors.textMuted : textColors[variant],
                fontSize: fontSizes[size],
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ==================== INPUT ====================

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  secureTextEntry?: boolean;
  multiline?: boolean;
  error?: string;
  icon?: string;
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  error,
  icon,
  style,
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon ? <Text style={styles.inputIcon}>{icon}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' }]}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// ==================== CARD ====================

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style, noPadding }) => {
  const content = (
    <View style={[styles.card, noPadding && { padding: 0 }, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

// ==================== BADGE ====================

interface BadgeProps {
  text: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  color = Colors.primary,
  bgColor,
  size = 'md',
}) => (
  <View
    style={[
      styles.badge,
      {
        backgroundColor: bgColor || `${color}20`,
        paddingHorizontal: size === 'sm' ? 6 : 10,
        paddingVertical: size === 'sm' ? 2 : 4,
      },
    ]}
  >
    <Text style={[styles.badgeText, { color, fontSize: size === 'sm' ? 10 : 12 }]}>{text}</Text>
  </View>
);

// ==================== STATUS BADGE ====================

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { color: string; label: string }> = {
    pendiente: { color: Colors.statusPending, label: 'Pendiente' },
    preparando: { color: Colors.statusPreparing, label: 'Preparando' },
    listo: { color: Colors.statusReady, label: 'Listo' },
    entregado: { color: Colors.statusDelivered, label: 'Entregado' },
    cancelado: { color: Colors.statusCancelled, label: 'Cancelado' },
    disponible: { color: Colors.tableAvailable, label: 'Disponible' },
    ocupada: { color: Colors.tableOccupied, label: 'Ocupada' },
    cuenta: { color: Colors.tableBill, label: 'Cuenta' },
  };

  const config = statusConfig[status] || { color: Colors.textMuted, label: status };

  return <Badge text={config.label} color={config.color} />;
};

// ==================== BOTTOM MODAL ====================

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: number | string;
}

export const BottomModal: React.FC<BottomModalProps> = ({
  visible,
  onClose,
  title,
  children,
  height = '85%',
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
      <View style={[styles.modalContent, { height: height as any }]}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// ==================== SECTION HEADER ====================

export const SectionHeader: React.FC<{ title: string; action?: { label: string; onPress: () => void } }> = ({
  title,
  action,
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action ? (
      <TouchableOpacity onPress={action.onPress}>
        <Text style={styles.sectionAction}>{action.label}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

// ==================== EMPTY STATE ====================

export const EmptyState: React.FC<{ icon: string; title: string; subtitle?: string }> = ({
  icon,
  title,
  subtitle,
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
  </View>
);

// ==================== TOGGLE ROW ====================

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  subtitle?: string;
  price?: number;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, value, onValueChange, subtitle, price }) => (
  <TouchableOpacity
    style={[styles.toggleRow, value && styles.toggleRowActive]}
    onPress={() => onValueChange(!value)}
    activeOpacity={0.7}
  >
    <View style={styles.toggleRowLeft}>
      <View style={[styles.checkbox, value && styles.checkboxActive]}>
        {value && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View>
        <Text style={[styles.toggleLabel, value && styles.toggleLabelActive]}>{label}</Text>
        {subtitle ? <Text style={styles.toggleSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
    {price !== undefined && price > 0 ? (
      <Text style={styles.togglePrice}>+${price}</Text>
    ) : null}
  </TouchableOpacity>
);

// ==================== STAT CARD ====================

export const StatCard: React.FC<{ icon: string; label: string; value: string; color?: string }> = ({
  icon,
  label,
  value,
  color = Colors.primary,
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ==================== CONFIRM DIALOG ====================

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  destructive = false,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.dialogOverlay}>
      <View style={styles.dialogCard}>
        <Text style={styles.dialogTitle}>{title}</Text>
        <Text style={styles.dialogMessage}>{message}</Text>
        <View style={styles.dialogButtons}>
          <Button title={cancelText} variant="secondary" onPress={onCancel} style={{ flex: 1, marginRight: 8 }} />
          <Button
            title={confirmText}
            variant={destructive ? 'danger' : 'primary'}
            onPress={onConfirm}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </View>
    </View>
  </Modal>
);

// ==================== LOADING ====================

export const LoadingScreen: React.FC = () => (
  <View style={styles.loadingScreen}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={styles.loadingText}>Cargando...</Text>
  </View>
);

// ==================== STYLES ====================

const styles = StyleSheet.create({
  // Button
  button: {
    borderRadius: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    fontWeight: '700',
  },

  // Input
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: Colors.bgInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    height: 48,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.small,
  },

  // Badge
  badge: {
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  modalContent: {
    backgroundColor: Colors.bgModal,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textMuted,
    borderRadius: 2,
    marginBottom: 12,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  modalClose: {
    position: 'absolute',
    right: 20,
    top: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionAction: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleRowActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  toggleRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
  },
  toggleLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  toggleLabelActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  toggleSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  togglePrice: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  // Stat Card
  statCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    flex: 1,
    ...Shadows.small,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },

  // Dialog
  dialogOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Shadows.large,
  },
  dialogTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  dialogMessage: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  dialogButtons: {
    flexDirection: 'row',
  },

  // Loading
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
});
