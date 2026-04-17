import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Colors } from '../../theme/colors';
import { Card, StatusBadge, Button, BottomModal, Input, EmptyState } from '../../components/UI';
import { getTables, saveTable } from '../../services/storage';
import { Table, TableStatus } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface Props { onBack: () => void; }

export const AdminTables: React.FC<Props> = ({ onBack }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [zone, setZone] = useState('Interior');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => { setTables(await getTables()); };
  useEffect(() => { loadData(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const zones = ['Interior', 'Terraza', 'Barra', 'Privado'];

  const handleSave = async () => {
    if (!name.trim()) return;
    const table: Table = {
      id: uuidv4(), name: name.trim(), capacity: Number(capacity) || 4,
      status: 'disponible', zone,
    };
    await saveTable(table); setShowModal(false); setName(''); loadData();
  };

  const statusColors: Record<TableStatus, string> = {
    disponible: Colors.tableAvailable,
    ocupada: Colors.tableOccupied,
    cuenta: Colors.tableBill,
  };

  const grouped = zones.map(z => ({
    zone: z,
    tables: tables.filter(t => t.zone === z),
  })).filter(g => g.tables.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Mesas</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}><Text style={styles.addText}>+ Nueva</Text></TouchableOpacity>
      </View>

      <FlatList
        data={grouped}
        keyExtractor={item => item.zone}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={<EmptyState icon="🪑" title="Sin mesas" />}
        renderItem={({ item }) => (
          <View style={styles.zoneSection}>
            <Text style={styles.zoneName}>{item.zone}</Text>
            <View style={styles.tablesGrid}>
              {item.tables.map(table => (
                <View key={table.id} style={[styles.tableCard, { borderLeftColor: statusColors[table.status] }]}>
                  <Text style={styles.tableName}>{table.name}</Text>
                  <Text style={styles.tableCapacity}>{table.capacity} personas</Text>
                  <StatusBadge status={table.status} />
                </View>
              ))}
            </View>
          </View>
        )}
      />

      <BottomModal visible={showModal} onClose={() => setShowModal(false)} title="Nueva mesa" height="55%">
        <Input label="Nombre" value={name} onChangeText={setName} placeholder="Mesa 11" icon="🪑" />
        <Input label="Capacidad" value={capacity} onChangeText={setCapacity} placeholder="4" keyboardType="numeric" icon="👥" />
        <Text style={styles.zoneLabel}>Zona</Text>
        <View style={styles.zoneGrid}>
          {zones.map(z => (
            <TouchableOpacity key={z} style={[styles.zoneChip, zone === z && styles.zoneChipActive]} onPress={() => setZone(z)}>
              <Text style={[styles.zoneChipText, zone === z && styles.zoneChipTextActive]}>{z}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button title="Crear mesa" onPress={handleSave} fullWidth size="lg" />
      </BottomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: Colors.bgSecondary, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  back: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addText: { color: Colors.textInverse, fontWeight: '700', fontSize: 14 },
  zoneSection: { marginBottom: 24 },
  zoneName: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  tablesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tableCard: { width: '47%', backgroundColor: Colors.bgCard, borderRadius: 14, padding: 14, borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.borderLight, gap: 4 },
  tableName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  tableCapacity: { color: Colors.textMuted, fontSize: 12 },
  zoneLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  zoneGrid: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  zoneChip: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center' },
  zoneChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  zoneChipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  zoneChipTextActive: { color: Colors.primary },
});
