import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { BottomModal, ToggleRow, Button, Input, SectionHeader } from '../../components/UI';
import { Product, OrderItem, OrderItemOption } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface ProductModalProps {
  visible: boolean;
  product: Product;
  onClose: () => void;
  onAddToOrder: (item: OrderItem) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ visible, product, onClose, onAddToOrder }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      // Initialize with defaults
      setQuantity(1);
      setNotes('');
      const defaults: Record<string, boolean> = {};
      product.configs.forEach(config => {
        config.options.forEach(option => {
          defaults[`${config.id}:${option.id}`] = option.isDefault;
        });
      });
      setSelectedOptions(defaults);
    }
  }, [visible, product]);

  const toggleOption = (configId: string, optionId: string) => {
    const key = `${configId}:${optionId}`;
    setSelectedOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isSelected = (configId: string, optionId: string) => {
    return !!selectedOptions[`${configId}:${optionId}`];
  };

  // Calculate total price
  const calculateTotal = () => {
    let extraPrice = 0;
    product.configs.forEach(config => {
      config.options.forEach(option => {
        if (isSelected(config.id, option.id) && option.extraPrice > 0) {
          extraPrice += option.extraPrice;
        }
      });
    });
    return (product.price + extraPrice) * quantity;
  };

  const handleAdd = () => {
    const options: OrderItemOption[] = [];
    product.configs.forEach(config => {
      config.options.forEach(option => {
        const selected = isSelected(config.id, option.id);
        options.push({
          configId: config.id,
          configName: config.name,
          optionId: option.id,
          optionName: option.name,
          extraPrice: option.extraPrice,
          isSelected: selected,
          wasDefault: option.isDefault,
        });
      });
    });

    const totalPrice = calculateTotal();
    const item: OrderItem = {
      id: uuidv4(),
      productId: product.id,
      productName: product.name,
      productType: product.type,
      basePrice: product.price,
      quantity,
      options,
      notes,
      totalPrice,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    onAddToOrder(item);
  };

  const total = calculateTotal();

  return (
    <BottomModal visible={visible} onClose={onClose} title={product.name}>
      {/* Product Header */}
      <View style={styles.productHeader}>
        <Text style={styles.productEmoji}>{product.type === 'cocina' ? '🍽️' : '🍹'}</Text>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBasePrice}>Precio base: ${product.price}</Text>
        </View>
      </View>

      {/* Quantity */}
      <View style={styles.quantitySection}>
        <Text style={styles.sectionLabel}>Cantidad</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, styles.qtyBtnAdd]}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={[styles.qtyBtnText, { color: Colors.textInverse }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Configurations */}
      {product.configs.map(config => (
        <View key={config.id} style={styles.configSection}>
          <SectionHeader title={config.name} />
          {config.options.map(option => {
            const selected = isSelected(config.id, option.id);
            const isDefault = option.isDefault;
            return (
              <ToggleRow
                key={option.id}
                label={option.name}
                value={selected}
                onValueChange={() => toggleOption(config.id, option.id)}
                subtitle={isDefault ? '✨ Viene por default' : undefined}
                price={option.extraPrice}
              />
            );
          })}
        </View>
      ))}

      {/* Notes */}
      <View style={styles.notesSection}>
        <Input
          label="Notas especiales"
          value={notes}
          onChangeText={setNotes}
          placeholder="Ej: Sin chile, bien cocido..."
          multiline
          icon="📝"
        />
      </View>

      {/* Add button */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${total.toFixed(0)}</Text>
        </View>
        <Button
          title={`Agregar al pedido · $${total.toFixed(0)}`}
          onPress={handleAdd}
          fullWidth
          size="lg"
        />
      </View>
      <View style={{ height: 20 }} />
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    padding: 14,
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
  },
  productEmoji: { fontSize: 40 },
  productInfo: { flex: 1 },
  productName: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  productBasePrice: { color: Colors.textMuted, fontSize: 14, marginTop: 2 },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 14,
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
  },
  sectionLabel: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtnAdd: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  qtyBtnText: { color: Colors.text, fontSize: 22, fontWeight: '700' },
  qtyValue: { color: Colors.text, fontSize: 24, fontWeight: '800', minWidth: 30, textAlign: 'center' },
  configSection: { marginBottom: 8 },
  notesSection: { marginTop: 8 },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: { color: Colors.textSecondary, fontSize: 16, fontWeight: '500' },
  totalPrice: { color: Colors.primary, fontSize: 28, fontWeight: '800' },
});
