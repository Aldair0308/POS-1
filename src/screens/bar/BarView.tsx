import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Card, Badge, StatusBadge, EmptyState } from '../../components/UI';
import { getBarOrders, updateOrderItemStatus } from '../../services/storage';
import { Order, OrderItem } from '../../types';

interface Props { onBack: () => void; }

export const BarView: React.FC<Props> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setOrders(await getBarOrders());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

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
      if (opt.isSelected && !opt.wasDefault) added.push(opt.optionName);
      if (!opt.isSelected && opt.wasDefault) removed.push(opt.optionName);
    });
    return { added, removed };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>🍹 Barra</Text>
          <Text style={styles.headerSub}>{orders.length} órdenes</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState icon="✅" title="¡Todo al corriente!" subtitle="No hay bebidas pendientes" />
        }
        renderItem={({ item: order }) => {
          const drinkItems = order.items.filter(
            i => i.productType === 'bebida' && (i.status === 'pendiente' || i.status === 'preparando')
          );

          return (
            <Card style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <Badge text={order.tableName} color={Colors.primary} />
                  <Text style={styles.waiterName}>{order.waiterName}</Text>
                </View>
                <Text style={styles.elapsed}>
                  {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)} min
                </Text>
              </View>

              {/* Drink Items */}
              {drinkItems.map(item => {
                const mods = getModifications(item);
                const isPending = item.status === 'pendiente';

                return (
                  <View key={item.id} style={styles.drinkItem}>
                    <View style={styles.drinkRow}>
                      <View style={styles.drinkInfo}>
                        <Text style={styles.drinkQty}>{item.quantity}x</Text>
                        <View>
                          <Text style={styles.drinkName}>{item.productName}</Text>
                          {/* Show escarchado and modifications */}
                          {mods.added.length > 0 && (
                            <Text style={styles.drinkMod}>
                              ➕ {mods.added.join(', ')}
                            </Text>
                          )}
                          {mods.removed.length > 0 && (
                            <Text style={styles.drinkModRemove}>
                              ❌ Sin {mods.removed.join(', ')}
                            </Text>
                          )}
                        </View>
                      </View>
                      <StatusBadge status={item.status} />
                    </View>

                    {item.notes ? (
                      <View style={styles.notesBg}>
                        <Text style={styles.notesText}>📝 {item.notes}</Text>
                      </View>
                    ) : null}

                    <View style={styles.drinkActions}>
                      {isPending ? (
                        <TouchableOpacity
                          style={styles.prepareBtn}
                          onPress={() => handleMarkPreparing(order.id, item.id)}
                        >
                          <Text style={styles.prepareBtnText}>🔥 Preparando</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.readyBtn}
                          onPress={() => handleMarkReady(order.id, item.id)}
                        >
                          <Text style={styles.readyBtnText}>✅ ¡Listo!</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </Card>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: Colors.bgSecondary, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  back: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  headerCenter: { alignItems: 'center' },
  title: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: 12 },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.bgTertiary, justifyContent: 'center', alignItems: 'center' },
  refreshText: { fontSize: 20 },
  list: { padding: 16, gap: 12 },
  orderCard: { marginBottom: 4 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  orderHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  waiterName: { color: Colors.textMuted, fontSize: 12 },
  elapsed: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  drinkItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  drinkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  drinkInfo: { flexDirection: 'row', gap: 10, flex: 1 },
  drinkQty: { color: Colors.primary, fontSize: 18, fontWeight: '800', backgroundColor: Colors.primaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  drinkName: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  drinkMod: { color: Colors.success, fontSize: 13, fontWeight: '500', marginTop: 2 },
  drinkModRemove: { color: Colors.danger, fontSize: 13, fontWeight: '500', marginTop: 2 },
  notesBg: { backgroundColor: Colors.warningBg, borderRadius: 8, padding: 8, marginTop: 6 },
  notesText: { color: Colors.warning, fontSize: 12, fontWeight: '500' },
  drinkActions: { marginTop: 8 },
  prepareBtn: { backgroundColor: Colors.infoBg, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.info },
  prepareBtnText: { color: Colors.info, fontSize: 14, fontWeight: '700' },
  readyBtn: { backgroundColor: Colors.success, paddingVertical: 12, borderRadius: 10, alignItems: 'center', ...Shadows.glow(Colors.success) },
  readyBtnText: { color: Colors.textInverse, fontSize: 14, fontWeight: '800' },
});
