import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Card, Badge, StatusBadge, EmptyState, Button } from '../../components/UI';
import { getKitchenOrders, updateOrderItemStatus } from '../../services/storage';
import { Order, OrderItem } from '../../types';

interface Props {
  onBack: () => void;
}

export const KitchenView: React.FC<Props> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setOrders(await getKitchenOrders());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleMarkReady = async (orderId: string, itemId: string) => {
    await updateOrderItemStatus(orderId, itemId, 'listo');
    loadData();
  };

  const handleMarkPreparing = async (orderId: string, itemId: string) => {
    await updateOrderItemStatus(orderId, itemId, 'preparando');
    loadData();
  };

  const getModifications = (item: OrderItem) => {
    const added: string[] = [];
    const removed: string[] = [];
    item.options.forEach(opt => {
      if (opt.isSelected && !opt.wasDefault) {
        added.push(opt.optionName + (opt.extraPrice > 0 ? ` (+$${opt.extraPrice})` : ''));
      }
      if (!opt.isSelected && opt.wasDefault) {
        removed.push(opt.optionName);
      }
    });
    return { added, removed };
  };

  const allItems: { orderId: string; tableName: string; waiterName: string; item: OrderItem }[] = [];
  orders.forEach(order => {
    order.items
      .filter(item => item.productType === 'cocina' && (item.status === 'pendiente' || item.status === 'preparando'))
      .forEach(item => {
        allItems.push({
          orderId: order.id,
          tableName: order.tableName,
          waiterName: order.waiterName,
          item,
        });
      });
  });

  // Sort: pendiente first, then by time
  allItems.sort((a, b) => {
    if (a.item.status === 'pendiente' && b.item.status !== 'pendiente') return -1;
    if (a.item.status !== 'pendiente' && b.item.status === 'pendiente') return 1;
    return new Date(a.item.createdAt).getTime() - new Date(b.item.createdAt).getTime();
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>👨‍🍳 Cocina</Text>
          <Text style={styles.headerSub}>{allItems.length} pendientes</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allItems}
        keyExtractor={(item, i) => `${item.orderId}-${item.item.id}-${i}`}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="✅"
            title="¡Todo al corriente!"
            subtitle="No hay platillos pendientes"
          />
        }
        renderItem={({ item: entry }) => {
          const mods = getModifications(entry.item);
          const isPending = entry.item.status === 'pendiente';
          const elapsed = Math.floor((Date.now() - new Date(entry.item.createdAt).getTime()) / 60000);

          return (
            <Card style={[styles.itemCard, isPending && styles.itemCardPending]}>
              {/* Top bar */}
              <View style={styles.itemTopBar}>
                <View style={styles.itemTopLeft}>
                  <Badge
                    text={entry.tableName}
                    color={Colors.primary}
                    size="sm"
                  />
                  <Text style={styles.waiterName}>{entry.waiterName}</Text>
                </View>
                <View style={styles.itemTopRight}>
                  <Text style={[styles.elapsed, elapsed > 15 && styles.elapsedUrgent]}>
                    {elapsed > 0 ? `${elapsed} min` : 'Ahora'}
                  </Text>
                  <StatusBadge status={entry.item.status} />
                </View>
              </View>

              {/* Product */}
              <View style={styles.productRow}>
                <Text style={styles.productQty}>{entry.item.quantity}x</Text>
                <Text style={styles.productName}>{entry.item.productName}</Text>
              </View>

              {/* Modifications - ONLY show diffs from default */}
              {(mods.added.length > 0 || mods.removed.length > 0) && (
                <View style={styles.modsContainer}>
                  {mods.removed.map((m, i) => (
                    <View key={`r${i}`} style={styles.modRow}>
                      <Text style={styles.modRemoved}>❌ Sin {m}</Text>
                    </View>
                  ))}
                  {mods.added.map((m, i) => (
                    <View key={`a${i}`} style={styles.modRow}>
                      <Text style={styles.modAdded}>➕ Extra {m}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Notes */}
              {entry.item.notes ? (
                <View style={styles.notesRow}>
                  <Text style={styles.notesText}>📝 {entry.item.notes}</Text>
                </View>
              ) : null}

              {/* Action */}
              <View style={styles.actionRow}>
                {isPending ? (
                  <TouchableOpacity
                    style={styles.prepareBtn}
                    onPress={() => handleMarkPreparing(entry.orderId, entry.item.id)}
                  >
                    <Text style={styles.prepareBtnText}>🔥 Preparando</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.readyBtn}
                    onPress={() => handleMarkReady(entry.orderId, entry.item.id)}
                  >
                    <Text style={styles.readyBtnText}>✅ ¡Listo!</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: Colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  back: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  headerCenter: { alignItems: 'center' },
  title: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: 12 },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.bgTertiary, justifyContent: 'center', alignItems: 'center' },
  refreshText: { fontSize: 20 },
  list: { padding: 16, gap: 12 },
  itemCard: { marginBottom: 4 },
  itemCardPending: { borderColor: Colors.statusPending, borderWidth: 1 },
  itemTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  waiterName: { color: Colors.textMuted, fontSize: 12 },
  itemTopRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  elapsed: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  elapsedUrgent: { color: Colors.danger, fontWeight: '700' },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  productQty: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '800',
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productName: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  modsContainer: {
    backgroundColor: Colors.bgInput,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  modRow: { paddingVertical: 2 },
  modRemoved: { color: Colors.danger, fontSize: 15, fontWeight: '600' },
  modAdded: { color: Colors.success, fontSize: 15, fontWeight: '600' },
  notesRow: {
    backgroundColor: Colors.warningBg,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  notesText: { color: Colors.warning, fontSize: 13, fontWeight: '500' },
  actionRow: { marginTop: 4 },
  prepareBtn: {
    backgroundColor: Colors.infoBg,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.info,
  },
  prepareBtnText: { color: Colors.info, fontSize: 16, fontWeight: '700' },
  readyBtn: {
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...Shadows.glow(Colors.success),
  },
  readyBtnText: { color: Colors.textInverse, fontSize: 16, fontWeight: '800' },
});
