import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Card, Badge, Button, EmptyState, ConfirmDialog, SectionHeader } from '../../components/UI';
import { getProducts, deleteProduct, getCategories } from '../../services/storage';
import { Product, Category } from '../../types';

interface AdminProductsProps {
  onBack: () => void;
  onEdit: (productId?: string) => void;
  onConfig: (productId: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ onBack, onEdit, onConfig }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [p, c] = await Promise.all([getProducts(), getCategories()]);
    setProducts(p);
    setCategories(c);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProduct(deleteId);
      setDeleteId(null);
      loadData();
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? `${cat.icon} ${cat.name}` : catId;
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card style={styles.productCard} onPress={() => onEdit(item.id)}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productEmoji}>
            {item.type === 'cocina' ? '🍽️' : '🍹'}
          </Text>
          <View style={styles.productText}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productCategory}>{getCategoryName(item.category)}</Text>
          </View>
        </View>
        <Text style={styles.productPrice}>${item.price}</Text>
      </View>

      <View style={styles.productMeta}>
        <Badge
          text={item.type === 'cocina' ? 'Cocina' : 'Bebida'}
          color={item.type === 'cocina' ? Colors.warning : Colors.info}
          size="sm"
        />
        <Badge
          text={`${item.configs.length} configs`}
          color={Colors.textSecondary}
          size="sm"
        />
        {!item.active && (
          <Badge text="Inactivo" color={Colors.danger} size="sm" />
        )}
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onConfig(item.id)}
        >
          <Text style={styles.actionBtnIcon}>⚙️</Text>
          <Text style={styles.actionBtnText}>Configurar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(item.id)}
        >
          <Text style={styles.actionBtnIcon}>✏️</Text>
          <Text style={styles.actionBtnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={() => setDeleteId(item.id)}
        >
          <Text style={styles.actionBtnIcon}>🗑️</Text>
          <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Productos</Text>
        <TouchableOpacity onPress={() => onEdit()} style={styles.addBtn}>
          <Text style={styles.addText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'Todos', icon: '📋', type: 'cocina' as const, order: 0 }, ...categories]}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === item.id && styles.filterChipActive]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={styles.filterChipIcon}>{item.icon}</Text>
              <Text style={[styles.filterChipText, selectedCategory === item.id && styles.filterChipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="📦"
            title="Sin productos"
            subtitle="Crea tu primer producto para empezar"
          />
        }
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        visible={!!deleteId}
        title="Eliminar producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Eliminar"
        destructive
      />
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
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  filterContainer: {
    backgroundColor: Colors.bgSecondary,
    paddingBottom: 12,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  productCard: {
    marginBottom: 4,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  productEmoji: {
    fontSize: 32,
  },
  productText: {
    flex: 1,
  },
  productName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  productCategory: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  productPrice: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  productMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.bgInput,
  },
  actionBtnDanger: {
    backgroundColor: Colors.dangerBg,
  },
  actionBtnIcon: {
    fontSize: 14,
  },
  actionBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
