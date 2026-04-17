import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Input, Button, Card, SectionHeader } from '../../components/UI';
import { getProduct, saveProduct, getCategories } from '../../services/storage';
import { Product, Category, ProductType } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface AdminProductFormProps {
  productId?: string;
  onBack: () => void;
  onSaved: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({ productId, onBack, onSaved }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<ProductType>('cocina');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cats = await getCategories();
    setCategories(cats);
    if (productId) {
      const product = await getProduct(productId);
      if (product) {
        setName(product.name);
        setPrice(product.price.toString());
        setType(product.type);
        setCategoryId(product.category);
        setActive(product.active);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!price || isNaN(Number(price))) {
      Alert.alert('Error', 'El precio debe ser un número válido');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }

    setLoading(true);
    try {
      let product: Product;
      if (productId) {
        const existing = await getProduct(productId);
        product = {
          ...existing!,
          name: name.trim(),
          price: Number(price),
          type,
          category: categoryId,
          active,
        };
      } else {
        product = {
          id: uuidv4(),
          name: name.trim(),
          price: Number(price),
          type,
          category: categoryId,
          configs: [],
          active: true,
          createdAt: new Date().toISOString(),
        };
      }
      await saveProduct(product);
      onSaved();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{productId ? 'Editar' : 'Nuevo'} Producto</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          label="Nombre del producto"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Hamburguesa Clásica"
          icon="📝"
        />

        <Input
          label="Precio"
          value={price}
          onChangeText={setPrice}
          placeholder="0.00"
          keyboardType="numeric"
          icon="💰"
        />

        {/* Product Type */}
        <SectionHeader title="Tipo de producto" />
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeOption, type === 'cocina' && styles.typeOptionActive]}
            onPress={() => { setType('cocina'); setCategoryId(''); }}
          >
            <Text style={styles.typeIcon}>🍽️</Text>
            <Text style={[styles.typeText, type === 'cocina' && styles.typeTextActive]}>Cocina</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeOption, type === 'bebida' && styles.typeOptionActive]}
            onPress={() => { setType('bebida'); setCategoryId(''); }}
          >
            <Text style={styles.typeIcon}>🍹</Text>
            <Text style={[styles.typeText, type === 'bebida' && styles.typeTextActive]}>Bebida</Text>
          </TouchableOpacity>
        </View>

        {/* Category */}
        <SectionHeader title="Categoría" />
        <View style={styles.categoryGrid}>
          {filteredCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryText, categoryId === cat.id && styles.categoryTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Toggle */}
        {productId && (
          <>
            <SectionHeader title="Estado" />
            <View style={styles.statusRow}>
              <TouchableOpacity
                style={[styles.statusOption, active && styles.statusOptionActive]}
                onPress={() => setActive(true)}
              >
                <Text style={[styles.statusText, active && styles.statusTextActive]}>✅ Activo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusOption, !active && styles.statusOptionInactive]}
                onPress={() => setActive(false)}
              >
                <Text style={[styles.statusText, !active && { color: Colors.danger }]}>❌ Inactivo</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
        <Button
          title={productId ? 'Guardar cambios' : 'Crear producto'}
          onPress={handleSave}
          loading={loading}
          fullWidth
          size="lg"
        />
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
  backBtn: { paddingVertical: 4 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  content: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  typeOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  typeIcon: { fontSize: 24 },
  typeText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  typeTextActive: { color: Colors.primary },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoryChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  categoryIcon: { fontSize: 16 },
  categoryText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  categoryTextActive: { color: Colors.primary },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  statusOptionActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.successBg,
  },
  statusOptionInactive: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerBg,
  },
  statusText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  statusTextActive: {
    color: Colors.success,
  },
});
