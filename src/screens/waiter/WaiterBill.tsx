import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Card, Button, Badge, SectionHeader, ConfirmDialog } from '../../components/UI';
import { getOrder, saveOrder, updateTableStatus } from '../../services/storage';
import { Order } from '../../types';

interface Props {
  orderId: string;
  onBack: () => void;
  onPaid: () => void;
}

export const WaiterBill: React.FC<Props> = ({ orderId, onBack, onPaid }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [tipPercent, setTipPercent] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    const o = await getOrder(orderId);
    if (o) setOrder(o);
  };

  const tipAmount = order ? order.subtotal * (tipPercent / 100) : 0;
  const grandTotal = order ? order.subtotal + tipAmount : 0;

  const handlePay = async () => {
    if (!order) return;
    const updatedOrder: Order = {
      ...order,
      status: 'entregado',
      tip: tipAmount,
      total: grandTotal,
      paymentMethod,
      closedAt: new Date().toISOString(),
      items: order.items.map(i => ({ ...i, status: 'entregado' as const })),
    };
    await saveOrder(updatedOrder);
    await updateTableStatus(order.tableId, 'disponible', undefined);
    setShowConfirm(false);
    onPaid();
  };

  if (!order) return null;

  // Get modifications for display
  const getModifications = (item: typeof order.items[0]) => {
    const added: string[] = [];
    const removed: string[] = [];
    item.options.forEach(opt => {
      if (opt.isSelected && !opt.wasDefault) {
        added.push(`+${opt.optionName}${opt.extraPrice > 0 ? ` ($${opt.extraPrice})` : ''}`);
      }
      if (!opt.isSelected && opt.wasDefault) {
        removed.push(`Sin ${opt.optionName}`);
      }
    });
    return { added, removed };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Cuenta</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Info */}
        <Card style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🪑 {order.tableName}</Text>
            <Text style={styles.infoLabel}>👤 {order.waiterName}</Text>
          </View>
          <Text style={styles.infoDate}>
            {new Date(order.createdAt).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
        </Card>

        {/* Items */}
        <SectionHeader title="Detalle del pedido" />
        {order.items.map((item, index) => {
          const mods = getModifications(item);
          return (
            <Card key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemQty}>{item.quantity}x</Text>
                  <Text style={styles.itemName}>{item.productName}</Text>
                </View>
                <Text style={styles.itemPrice}>${item.totalPrice.toFixed(0)}</Text>
              </View>
              {(mods.added.length > 0 || mods.removed.length > 0) && (
                <View style={styles.modsContainer}>
                  {mods.added.map((m, i) => (
                    <Text key={`a${i}`} style={styles.modAdded}>➕ {m}</Text>
                  ))}
                  {mods.removed.map((m, i) => (
                    <Text key={`r${i}`} style={styles.modRemoved}>❌ {m}</Text>
                  ))}
                </View>
              )}
              {item.notes ? <Text style={styles.itemNotes}>📝 {item.notes}</Text> : null}
            </Card>
          );
        })}

        {/* Tip */}
        <SectionHeader title="Propina" />
        <View style={styles.tipRow}>
          {[0, 10, 15, 20].map(pct => (
            <TouchableOpacity
              key={pct}
              style={[styles.tipChip, tipPercent === pct && styles.tipChipActive]}
              onPress={() => setTipPercent(pct)}
            >
              <Text style={[styles.tipText, tipPercent === pct && styles.tipTextActive]}>
                {pct === 0 ? 'Sin' : `${pct}%`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <SectionHeader title="Método de pago" />
        <View style={styles.paymentRow}>
          {([
            { key: 'efectivo' as const, icon: '💵', label: 'Efectivo' },
            { key: 'tarjeta' as const, icon: '💳', label: 'Tarjeta' },
            { key: 'transferencia' as const, icon: '📱', label: 'Transfer.' },
          ]).map(pm => (
            <TouchableOpacity
              key={pm.key}
              style={[styles.payChip, paymentMethod === pm.key && styles.payChipActive]}
              onPress={() => setPaymentMethod(pm.key)}
            >
              <Text style={styles.payIcon}>{pm.icon}</Text>
              <Text style={[styles.payText, paymentMethod === pm.key && styles.payTextActive]}>{pm.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Totals */}
        <Card style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${order.subtotal.toFixed(0)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Propina ({tipPercent}%)</Text>
            <Text style={styles.totalValue}>${tipAmount.toFixed(0)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>${grandTotal.toFixed(0)}</Text>
          </View>
        </Card>

        <Button
          title={`💳 Cobrar $${grandTotal.toFixed(0)}`}
          onPress={() => setShowConfirm(true)}
          fullWidth
          size="lg"
        />
        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmDialog
        visible={showConfirm}
        title="Confirmar cobro"
        message={`¿Cobrar $${grandTotal.toFixed(0)} con ${paymentMethod}?`}
        onConfirm={handlePay}
        onCancel={() => setShowConfirm(false)}
        confirmText="Cobrar"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: Colors.bgSecondary, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  back: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  content: { padding: 16 },
  orderInfo: { marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  infoLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  infoDate: { color: Colors.textMuted, fontSize: 12 },
  itemCard: { marginBottom: 8 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemQty: { color: Colors.primary, fontSize: 16, fontWeight: '800', backgroundColor: Colors.primaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  itemName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  itemPrice: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  modsContainer: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  modAdded: { color: Colors.success, fontSize: 13, fontWeight: '500', marginBottom: 2 },
  modRemoved: { color: Colors.danger, fontSize: 13, fontWeight: '500', marginBottom: 2 },
  itemNotes: { color: Colors.textMuted, fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  tipRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tipChip: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center' },
  tipChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  tipText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '700' },
  tipTextActive: { color: Colors.primary },
  paymentRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  payChip: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center', gap: 4 },
  payChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  payIcon: { fontSize: 24 },
  payText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  payTextActive: { color: Colors.primary },
  totalsCard: { marginBottom: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalLabel: { color: Colors.textSecondary, fontSize: 15 },
  totalValue: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12, marginTop: 8 },
  grandTotalLabel: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  grandTotalValue: { color: Colors.primary, fontSize: 24, fontWeight: '800' },
});
