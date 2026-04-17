import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Card, StatCard, SectionHeader } from '../../components/UI';
import { getDailySummary } from '../../services/storage';
import { DailySummary } from '../../types';

interface Props { onBack: () => void; }

export const AdminReports: React.FC<Props> = ({ onBack }) => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => { setSummary(await getDailySummary()); };
  useEffect(() => { loadData(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Reportes</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={styles.dateLabel}>📅 {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>

        <View style={styles.statsRow}>
          <StatCard icon="💰" label="Ventas" value={`$${(summary?.totalSales || 0).toLocaleString()}`} color={Colors.success} />
          <View style={{ width: 12 }} />
          <StatCard icon="🧾" label="Pedidos" value={`${summary?.totalOrders || 0}`} color={Colors.primary} />
        </View>
        <View style={[styles.statsRow, { marginTop: 12 }]}>
          <StatCard icon="🎫" label="Ticket prom." value={`$${(summary?.averageTicket || 0).toFixed(0)}`} color={Colors.warning} />
          <View style={{ width: 12 }} />
          <StatCard icon="📊" label="Top prods." value={`${summary?.topProducts.length || 0}`} color={Colors.info} />
        </View>

        {/* Sales by Hour Chart */}
        {summary && summary.ordersByHour.length > 0 && (
          <>
            <SectionHeader title="Ventas por hora" />
            <Card>
              <View style={styles.chartContainer}>
                {summary.ordersByHour.map((h, i) => {
                  const maxCount = Math.max(...summary.ordersByHour.map(x => x.count), 1);
                  const height = (h.count / maxCount) * 100;
                  return (
                    <View key={i} style={styles.barColumn}>
                      <View style={[styles.bar, { height: Math.max(height, 4), backgroundColor: h.count > 0 ? Colors.primary : Colors.bgInput }]} />
                      <Text style={styles.barLabel}>{h.hour}</Text>
                      {h.count > 0 && <Text style={styles.barValue}>{h.count}</Text>}
                    </View>
                  );
                })}
              </View>
            </Card>
          </>
        )}

        {/* Top Products */}
        {summary && summary.topProducts.length > 0 && (
          <>
            <SectionHeader title="Productos más vendidos" />
            <Card>
              {summary.topProducts.map((p, i) => (
                <View key={i} style={[styles.topRow, i < summary.topProducts.length - 1 && styles.topRowBorder]}>
                  <View style={styles.topLeft}>
                    <View style={styles.rankBadge}><Text style={styles.rankText}>{i + 1}</Text></View>
                    <View>
                      <Text style={styles.topName}>{p.name}</Text>
                      <Text style={styles.topQty}>{p.quantity} vendidos</Text>
                    </View>
                  </View>
                  <Text style={styles.topRevenue}>${p.revenue.toLocaleString()}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {(!summary || (summary.totalOrders === 0)) && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Sin datos para hoy</Text>
            <Text style={styles.emptySubtext}>Los reportes se generan cuando hay pedidos completados</Text>
          </Card>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: Colors.bgSecondary, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  back: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  content: { padding: 20 },
  dateLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 16, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, paddingTop: 20 },
  barColumn: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  bar: { width: 12, borderRadius: 6, minHeight: 4 },
  barLabel: { color: Colors.textMuted, fontSize: 9, marginTop: 4 },
  barValue: { color: Colors.primary, fontSize: 9, fontWeight: '700', position: 'absolute', top: -14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  topRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center' },
  rankText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  topName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  topQty: { color: Colors.textMuted, fontSize: 12 },
  topRevenue: { color: Colors.success, fontSize: 15, fontWeight: '700' },
  emptyCard: { alignItems: 'center', paddingVertical: 40, marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  emptySubtext: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 },
});
