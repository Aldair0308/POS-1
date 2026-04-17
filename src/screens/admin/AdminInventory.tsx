import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Colors } from '../../theme/colors';
import { Card, Badge, Input, EmptyState } from '../../components/UI';
import { getInventory, saveInventoryItem } from '../../services/storage';
import { InventoryItem } from '../../types';

interface Props { onBack: () => void; }

export const AdminInventory: React.FC<Props> = ({ onBack }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => { setItems(await getInventory()); };
  useEffect(() => { loadData(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const adjustStock = async (item: InventoryItem, delta: number) => {
    const updated = { ...item, stock: Math.max(0, item.stock + delta), lastUpdated: new Date().toISOString() };
    await saveInventoryItem(updated);
    loadData();
  };

  const getStockColor = (item: InventoryItem) => {
    if (item.stock <= item.minStock * 0.5) return Colors.danger;
    if (item.stock <= item.minStock) return Colors.warning;
    return Colors.success;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Inventario</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={<EmptyState icon="📋" title="Sin inventario" />}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.productName}</Text>
                <View style={styles.stockRow}>
                  <View style={[styles.stockIndicator, { backgroundColor: getStockColor(item) }]} />
                  <Text style={[styles.stock, { color: getStockColor(item) }]}>
                    {item.stock} {item.unit}
                  </Text>
                  <Text style={styles.minStock}>Min: {item.minStock}</Text>
                </View>
                {item.stock <= item.minStock && (
                  <Badge text="⚠️ Stock bajo" color={Colors.warning} size="sm" />
                )}
              </View>
              <View style={styles.controls}>
                <TouchableOpacity style={styles.controlBtn} onPress={() => adjustStock(item, -1)}>
                  <Text style={styles.controlText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.controlValue}>{item.stock}</Text>
                <TouchableOpacity style={[styles.controlBtn, styles.controlBtnAdd]} onPress={() => adjustStock(item, 1)}>
                  <Text style={[styles.controlText, { color: Colors.textInverse }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: Colors.bgSecondary, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  back: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1, gap: 4 },
  name: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockIndicator: { width: 8, height: 8, borderRadius: 4 },
  stock: { fontSize: 14, fontWeight: '700' },
  minStock: { color: Colors.textMuted, fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  controlBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  controlBtnAdd: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  controlText: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  controlValue: { color: Colors.text, fontSize: 18, fontWeight: '700', minWidth: 32, textAlign: 'center' },
});
