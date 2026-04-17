import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Card, Button, Input, BottomModal, ConfirmDialog, Badge, EmptyState } from '../../components/UI';
import { getUsers, saveUser, deleteUser } from '../../services/storage';
import { User, UserRole } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface AdminUsersProps { onBack: () => void; }

export const AdminUsers: React.FC<AdminUsersProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<UserRole>('mesero');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setUsers(await getUsers());
  };
  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const openNew = () => {
    setEditing(null); setName(''); setEmail(''); setPin(''); setRole('mesero');
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditing(u); setName(u.name); setEmail(u.email); setPin(u.pin); setRole(u.role);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !pin.trim()) {
      Alert.alert('Error', 'Nombre y PIN son obligatorios'); return;
    }
    const user: User = {
      id: editing?.id || uuidv4(),
      name: name.trim(), email: email.trim(), pin: pin.trim(),
      role, active: true, createdAt: editing?.createdAt || new Date().toISOString(),
    };
    await saveUser(user); setShowModal(false); loadData();
  };

  const handleDelete = async () => {
    if (deleteId) { await deleteUser(deleteId); setDeleteId(null); loadData(); }
  };

  const roleConfig: Record<UserRole, { icon: string; label: string; color: string }> = {
    admin: { icon: '👑', label: 'Admin', color: Colors.primary },
    mesero: { icon: '🍽️', label: 'Mesero', color: Colors.info },
    cocina: { icon: '👨‍🍳', label: 'Cocina', color: Colors.warning },
    barra: { icon: '🍹', label: 'Barra', color: Colors.success },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Usuarios</Text>
        <TouchableOpacity onPress={openNew} style={styles.addBtn}><Text style={styles.addText}>+ Nuevo</Text></TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={<EmptyState icon="👥" title="Sin usuarios" />}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.userRow}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: roleConfig[item.role].color + '20' }]}>
                  <Text style={styles.avatarText}>{roleConfig[item.role].icon}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <Badge text={roleConfig[item.role].label} color={roleConfig[item.role].color} size="sm" />
                    <Badge text={`PIN: ${item.pin}`} color={Colors.textMuted} size="sm" />
                  </View>
                </View>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                  <Text>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDeleteId(item.id)} style={[styles.iconBtn, { backgroundColor: Colors.dangerBg }]}>
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />

      <BottomModal visible={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar usuario' : 'Nuevo usuario'} height="65%">
        <Input label="Nombre" value={name} onChangeText={setName} placeholder="Nombre completo" icon="👤" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="email@resto.mx" keyboardType="email-address" icon="📧" />
        <Input label="PIN (4 dígitos)" value={pin} onChangeText={setPin} placeholder="1234" keyboardType="numeric" icon="🔑" />
        <Text style={styles.roleLabel}>Rol</Text>
        <View style={styles.roleGrid}>
          {(Object.keys(roleConfig) as UserRole[]).map(r => (
            <TouchableOpacity key={r} style={[styles.roleChip, role === r && styles.roleChipActive]} onPress={() => setRole(r)}>
              <Text style={styles.roleIcon}>{roleConfig[r].icon}</Text>
              <Text style={[styles.roleText, role === r && { color: roleConfig[r].color }]}>{roleConfig[r].label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button title="Guardar" onPress={handleSave} fullWidth size="lg" />
      </BottomModal>

      <ConfirmDialog visible={!!deleteId} title="Eliminar usuario" message="¿Seguro?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} destructive confirmText="Eliminar" />
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
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22 },
  userName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  userEmail: { color: Colors.textMuted, fontSize: 12 },
  userActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center' },
  roleLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  roleGrid: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  roleChip: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.borderLight, gap: 4 },
  roleChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  roleIcon: { fontSize: 20 },
  roleText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
});
