import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { StatCard, Card, SectionHeader, Badge } from '../../components/UI';
import { getOrders, getProducts, getTables, getDailySummary } from '../../services/storage';
import { User, DailySummary } from '../../types';

interface AdminDashboardProps {
  user: User;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onNavigate, onLogout }) => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [tableCount, setTableCount] = useState({ total: 0, occupied: 0 });
  const [productCount, setProductCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [s, tables, products] = await Promise.all([
      getDailySummary(),
      getTables(),
      getProducts(),
    ]);
    setSummary(s);
    setTableCount({
      total: tables.length,
      occupied: tables.filter(t => t.status === 'ocupada').length,
    });
    setProductCount(products.filter(p => p.active).length);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const menuItems = [
    { icon: '📦', label: 'Productos', screen: 'AdminProducts', color: Colors.primary },
    { icon: '👥', label: 'Usuarios', screen: 'AdminUsers', color: Colors.info },
    { icon: '🪑', label: 'Mesas', screen: 'AdminTables', color: Colors.success },
    { icon: '📊', label: 'Reportes', screen: 'AdminReports', color: Colors.warning },
    { icon: '📋', label: 'Inventario', screen: 'AdminInventory', color: Colors.danger },
    { icon: '🍽️', label: 'POS Mesero', screen: 'WaiterPOS', color: '#A78BFA' },
    { icon: '👨‍🍳', label: 'Cocina', screen: 'KitchenView', color: Colors.statusPreparing },
    { icon: '🍹', label: 'Barra', screen: 'BarView', color: Colors.primaryLight },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user.name.split(' ')[0]} 👋</Text>
          <Text style={styles.role}>Administrador</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.content}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon="💰"
            label="Ventas hoy"
            value={`$${(summary?.totalSales || 0).toLocaleString()}`}
            color={Colors.success}
          />
          <View style={{ width: 12 }} />
          <StatCard
            icon="🧾"
            label="Pedidos"
            value={`${summary?.totalOrders || 0}`}
            color={Colors.primary}
          />
        </View>

        <View style={[styles.statsRow, { marginTop: 12 }]}>
          <StatCard
            icon="🪑"
            label="Mesas ocupadas"
            value={`${tableCount.occupied}/${tableCount.total}`}
            color={Colors.warning}
          />
          <View style={{ width: 12 }} />
          <StatCard
            icon="📦"
            label="Productos"
            value={`${productCount}`}
            color={Colors.info}
          />
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Acceso rápido" />
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.menuItem}
              onPress={() => onNavigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Products */}
        {summary && summary.topProducts.length > 0 && (
          <>
            <SectionHeader title="Top productos hoy" />
            <Card>
              {summary.topProducts.slice(0, 5).map((product, index) => (
                <View key={index} style={[styles.topProductRow, index < summary.topProducts.length - 1 && styles.topProductBorder]}>
                  <View style={styles.topProductLeft}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.topProductName}>{product.name}</Text>
                  </View>
                  <View style={styles.topProductRight}>
                    <Text style={styles.topProductQty}>{product.quantity}x</Text>
                    <Text style={styles.topProductRevenue}>${product.revenue.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Average Ticket */}
        {summary && (
          <>
            <SectionHeader title="Ticket promedio" />
            <Card>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketIcon}>🎫</Text>
                <Text style={styles.ticketValue}>
                  ${summary.averageTicket.toFixed(0)}
                </Text>
                <Text style={styles.ticketLabel}>por orden</Text>
              </View>
            </Card>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
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
  greeting: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  role: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: Colors.dangerBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: {
    color: Colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  menuItem: {
    width: '22%',
    alignItems: 'center',
    gap: 8,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconText: {
    fontSize: 24,
  },
  menuLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  topProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  topProductBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  topProductLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  topProductName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  topProductRight: {
    alignItems: 'flex-end',
  },
  topProductQty: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  topProductRevenue: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ticketIcon: {
    fontSize: 32,
  },
  ticketValue: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  ticketLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
