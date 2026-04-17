import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Card, Button, StatusBadge, EmptyState, SectionHeader, Badge } from '../../components/UI';
import { getTables, getProducts, getCategories, getOrder, saveOrder, updateTableStatus } from '../../services/storage';
import { Table, Product, Category, Order, OrderItem, OrderItemOption, User } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { ProductModal } from './ProductModal';

interface WaiterPOSProps {
  user: User;
  onBack: () => void;
  onBill: (orderId: string) => void;
}

export const WaiterPOS: React.FC<WaiterPOSProps> = ({ user, onBack, onBill }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'tables' | 'menu'>('tables');

  const loadData = useCallback(async () => {
    const [t, p, c] = await Promise.all([getTables(), getProducts(), getCategories()]);
    setTables(t);
    setProducts(p.filter(pr => pr.active));
    setCategories(c);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const handleSelectTable = async (table: Table) => {
    setSelectedTable(table);
    if (table.currentOrderId) {
      const order = await getOrder(table.currentOrderId);
      setCurrentOrder(order || null);
    } else {
      // Create new order
      const newOrder: Order = {
        id: uuidv4(),
        tableId: table.id,
        tableName: table.name,
        waiterId: user.id,
        waiterName: user.name,
        items: [],
        status: 'pendiente',
        subtotal: 0,
        total: 0,
        tip: 0,
        createdAt: new Date().toISOString(),
      };
      setCurrentOrder(newOrder);
    }
    setView('menu');
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleAddToOrder = async (item: OrderItem) => {
    if (!currentOrder || !selectedTable) return;

    const updatedItems = [...currentOrder.items, item];
    const subtotal = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const updatedOrder: Order = {
      ...currentOrder,
      items: updatedItems,
      subtotal,
      total: subtotal,
      status: 'pendiente',
    };

    await saveOrder(updatedOrder);
    await updateTableStatus(selectedTable.id, 'ocupada', updatedOrder.id);
    setCurrentOrder(updatedOrder);
    setShowProductModal(false);
    loadData();
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!currentOrder) return;
    const updatedItems = currentOrder.items.filter(i => i.id !== itemId);
    const subtotal = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const updatedOrder = { ...currentOrder, items: updatedItems, subtotal, total: subtotal };
    await saveOrder(updatedOrder);
    setCurrentOrder(updatedOrder);
  };

  const handleSendToKitchen = async () => {
    if (!currentOrder) return;
    const updatedItems = currentOrder.items.map(i =>
      i.status === 'pendiente' ? { ...i, status: 'preparando' as const } : i
    );
    const updatedOrder: Order = { ...currentOrder, items: updatedItems, status: 'preparando' };
    await saveOrder(updatedOrder);
    setCurrentOrder(updatedOrder);
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  // ==================== TABLES VIEW ====================
  if (view === 'tables') {
    const zones = [...new Set(tables.map(t => t.zone))];
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
          <Text style={styles.title}>Mesas</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {zones.map(zone => (
            <View key={zone} style={styles.zoneSection}>
              <Text style={styles.zoneName}>{zone}</Text>
              <View style={styles.tablesGrid}>
                {tables.filter(t => t.zone === zone).map(table => {
                  const statusColor = table.status === 'disponible' ? Colors.tableAvailable
                    : table.status === 'ocupada' ? Colors.tableOccupied : Colors.tableBill;
                  return (
                    <TouchableOpacity
                      key={table.id}
                      style={[styles.tableCard, { borderColor: statusColor }]}
                      onPress={() => handleSelectTable(table)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.tableEmoji}>🪑</Text>
                      <Text style={styles.tableName}>{table.name}</Text>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.tableStatus, { color: statusColor }]}>{table.status}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ==================== MENU VIEW ====================
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setView('tables')}><Text style={styles.back}>← Mesas</Text></TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{selectedTable?.name}</Text>
          {currentOrder && <Text style={styles.headerSub}>{currentOrder.items.length} items</Text>}
        </View>
        {currentOrder && currentOrder.items.length > 0 && (
          <TouchableOpacity style={styles.billBtn} onPress={() => onBill(currentOrder.id)}>
            <Text style={styles.billText}>💳 Cuenta</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.catContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
          <TouchableOpacity
            style={[styles.catChip, selectedCategory === 'all' && styles.catChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={styles.catIcon}>📋</Text>
            <Text style={[styles.catText, selectedCategory === 'all' && styles.catTextActive]}>Todos</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catText, selectedCategory === cat.id && styles.catTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Split view: Products + Order */}
      <View style={styles.splitView}>
        {/* Products Grid */}
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          columnWrapperStyle={{ gap: 10 }}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => handleSelectProduct(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.productEmoji}>{item.type === 'cocina' ? '🍽️' : '🍹'}</Text>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
              {item.configs.length > 0 && (
                <Text style={styles.productConfigs}>⚙️ {item.configs.length} config</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Order Summary Bar */}
      {currentOrder && currentOrder.items.length > 0 && (
        <View style={styles.orderBar}>
          <View style={styles.orderBarLeft}>
            <Text style={styles.orderBarItems}>{currentOrder.items.length} items</Text>
            <Text style={styles.orderBarTotal}>${currentOrder.total.toFixed(0)}</Text>
          </View>
          <View style={styles.orderBarActions}>
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendToKitchen}>
              <Text style={styles.sendBtnText}>🔥 Enviar a cocina</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          visible={showProductModal}
          product={selectedProduct}
          onClose={() => setShowProductModal(false)}
          onAddToOrder={handleAddToOrder}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, backgroundColor: Colors.bgSecondary, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  back: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  headerCenter: { alignItems: 'center' },
  headerSub: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },
  billBtn: { backgroundColor: Colors.primaryBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  billText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  content: { padding: 16 },
  // Tables
  zoneSection: { marginBottom: 24 },
  zoneName: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  tablesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tableCard: { width: '30%', aspectRatio: 1, backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', gap: 4, ...Shadows.small },
  tableEmoji: { fontSize: 28 },
  tableName: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  tableStatus: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  // Categories
  catContainer: { backgroundColor: Colors.bgSecondary, paddingVertical: 8 },
  catList: { paddingHorizontal: 12, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bgTertiary, borderWidth: 1, borderColor: Colors.borderLight },
  catChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  catIcon: { fontSize: 14 },
  catText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  catTextActive: { color: Colors.primary },
  // Products
  splitView: { flex: 1 },
  productsGrid: { padding: 12, gap: 10 },
  productCard: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.borderLight, gap: 4, ...Shadows.small },
  productEmoji: { fontSize: 28 },
  productName: { color: Colors.text, fontSize: 14, fontWeight: '600', marginTop: 4 },
  productPrice: { color: Colors.primary, fontSize: 18, fontWeight: '800' },
  productConfigs: { color: Colors.textMuted, fontSize: 11 },
  // Order Bar
  orderBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.bgSecondary, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingBottom: 30 },
  orderBarLeft: { gap: 2 },
  orderBarItems: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  orderBarTotal: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  orderBarActions: { flexDirection: 'row', gap: 8 },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, ...Shadows.glow(Colors.primary) },
  sendBtnText: { color: Colors.textInverse, fontSize: 15, fontWeight: '700' },
});
