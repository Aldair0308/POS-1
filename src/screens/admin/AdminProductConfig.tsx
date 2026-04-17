import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Input, Button, Card, SectionHeader, BottomModal, ToggleRow, ConfirmDialog } from '../../components/UI';
import { getProduct, saveProduct } from '../../services/storage';
import { Product, ProductConfig, ConfigOption } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface AdminProductConfigProps {
  productId: string;
  onBack: () => void;
}

export const AdminProductConfig: React.FC<AdminProductConfigProps> = ({ productId, onBack }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ProductConfig | null>(null);
  const [editingConfigId, setEditingConfigId] = useState<string>('');
  const [configName, setConfigName] = useState('');
  const [optionName, setOptionName] = useState('');
  const [optionPrice, setOptionPrice] = useState('');
  const [optionDefault, setOptionDefault] = useState(false);
  const [editingOption, setEditingOption] = useState<ConfigOption | null>(null);
  const [deleteConfigId, setDeleteConfigId] = useState<string | null>(null);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    const p = await getProduct(productId);
    if (p) setProduct(p);
  };

  const saveChanges = async (updatedProduct: Product) => {
    await saveProduct(updatedProduct);
    setProduct(updatedProduct);
  };

  // ==================== CONFIG CRUD ====================

  const openNewConfig = () => {
    setEditingConfig(null);
    setConfigName('');
    setShowConfigModal(true);
  };

  const openEditConfig = (config: ProductConfig) => {
    setEditingConfig(config);
    setConfigName(config.name);
    setShowConfigModal(true);
  };

  const handleSaveConfig = async () => {
    if (!configName.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!product) return;

    let updatedConfigs: ProductConfig[];
    if (editingConfig) {
      updatedConfigs = product.configs.map(c =>
        c.id === editingConfig.id ? { ...c, name: configName.trim() } : c
      );
    } else {
      const newConfig: ProductConfig = {
        id: uuidv4(),
        name: configName.trim(),
        options: [],
        order: product.configs.length + 1,
      };
      updatedConfigs = [...product.configs, newConfig];
    }

    await saveChanges({ ...product, configs: updatedConfigs });
    setShowConfigModal(false);
  };

  const handleDeleteConfig = async () => {
    if (!product || !deleteConfigId) return;
    const updatedConfigs = product.configs.filter(c => c.id !== deleteConfigId);
    await saveChanges({ ...product, configs: updatedConfigs });
    setDeleteConfigId(null);
  };

  // ==================== OPTION CRUD ====================

  const openNewOption = (configId: string) => {
    setEditingConfigId(configId);
    setEditingOption(null);
    setOptionName('');
    setOptionPrice('');
    setOptionDefault(false);
    setShowOptionModal(true);
  };

  const openEditOption = (configId: string, option: ConfigOption) => {
    setEditingConfigId(configId);
    setEditingOption(option);
    setOptionName(option.name);
    setOptionPrice(option.extraPrice.toString());
    setOptionDefault(option.isDefault);
    setShowOptionModal(true);
  };

  const handleSaveOption = async () => {
    if (!optionName.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!product) return;

    const updatedConfigs = product.configs.map(config => {
      if (config.id !== editingConfigId) return config;

      let updatedOptions: ConfigOption[];
      if (editingOption) {
        updatedOptions = config.options.map(o =>
          o.id === editingOption.id
            ? { ...o, name: optionName.trim(), extraPrice: Number(optionPrice) || 0, isDefault: optionDefault }
            : o
        );
      } else {
        const newOption: ConfigOption = {
          id: uuidv4(),
          name: optionName.trim(),
          extraPrice: Number(optionPrice) || 0,
          isDefault: optionDefault,
          order: config.options.length + 1,
        };
        updatedOptions = [...config.options, newOption];
      }
      return { ...config, options: updatedOptions };
    });

    await saveChanges({ ...product, configs: updatedConfigs });
    setShowOptionModal(false);
  };

  const handleDeleteOption = async (configId: string, optionId: string) => {
    if (!product) return;
    const updatedConfigs = product.configs.map(config => {
      if (config.id !== configId) return config;
      return { ...config, options: config.options.filter(o => o.id !== optionId) };
    });
    await saveChanges({ ...product, configs: updatedConfigs });
  };

  const toggleOptionDefault = async (configId: string, optionId: string) => {
    if (!product) return;
    const updatedConfigs = product.configs.map(config => {
      if (config.id !== configId) return config;
      return {
        ...config,
        options: config.options.map(o =>
          o.id === optionId ? { ...o, isDefault: !o.isDefault } : o
        ),
      };
    });
    await saveChanges({ ...product, configs: updatedConfigs });
  };

  if (!product) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Configuración</Text>
          <Text style={styles.subtitle}>{product.name}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryEmoji}>{product.type === 'cocina' ? '🍽️' : '🍹'}</Text>
            <View>
              <Text style={styles.summaryName}>{product.name}</Text>
              <Text style={styles.summaryPrice}>${product.price}</Text>
            </View>
          </View>
        </Card>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Las opciones marcadas como "default" son las que vienen preseleccionadas 
            cuando un mesero agrega este producto al pedido.
          </Text>
        </View>

        {/* Configurations */}
        <SectionHeader
          title={`Configuraciones (${product.configs.length})`}
          action={{ label: '+ Agregar', onPress: openNewConfig }}
        />

        {product.configs.length === 0 ? (
          <Card style={styles.emptyConfigCard}>
            <Text style={styles.emptyConfigIcon}>⚙️</Text>
            <Text style={styles.emptyConfigText}>Sin configuraciones</Text>
            <Text style={styles.emptyConfigSubtext}>
              Agrega configuraciones como "Ingredientes", "Extras" o "Escarchado"
            </Text>
            <Button
              title="Agregar configuración"
              onPress={openNewConfig}
              variant="ghost"
              size="sm"
              style={{ marginTop: 12 }}
            />
          </Card>
        ) : (
          product.configs.map((config) => (
            <Card key={config.id} style={styles.configCard}>
              {/* Config Header */}
              <View style={styles.configHeader}>
                <View style={styles.configTitleRow}>
                  <Text style={styles.configName}>{config.name}</Text>
                  <Text style={styles.configCount}>{config.options.length} opciones</Text>
                </View>
                <View style={styles.configActions}>
                  <TouchableOpacity
                    onPress={() => openEditConfig(config)}
                    style={styles.configActionBtn}
                  >
                    <Text style={styles.configActionText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDeleteConfigId(config.id)}
                    style={styles.configActionBtn}
                  >
                    <Text style={styles.configActionText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Options List */}
              {config.options.map((option) => (
                <View key={option.id} style={styles.optionRow}>
                  <TouchableOpacity
                    style={styles.optionLeft}
                    onPress={() => toggleOptionDefault(config.id, option.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.defaultToggle, option.isDefault && styles.defaultToggleActive]}>
                      {option.isDefault && <Text style={styles.defaultCheck}>✓</Text>}
                    </View>
                    <View>
                      <Text style={[styles.optionName, option.isDefault && styles.optionNameDefault]}>
                        {option.name}
                      </Text>
                      {option.isDefault && (
                        <Text style={styles.defaultLabel}>Default</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.optionRight}>
                    {option.extraPrice > 0 && (
                      <Text style={styles.optionPrice}>+${option.extraPrice}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.optionEditBtn}
                      onPress={() => openEditOption(config.id, option)}
                    >
                      <Text style={styles.optionEditText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.optionDeleteBtn}
                      onPress={() => handleDeleteOption(config.id, option.id)}
                    >
                      <Text style={styles.optionEditText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Add Option */}
              <TouchableOpacity
                style={styles.addOptionBtn}
                onPress={() => openNewOption(config.id)}
              >
                <Text style={styles.addOptionText}>+ Agregar opción</Text>
              </TouchableOpacity>
            </Card>
          ))
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Config Modal */}
      <BottomModal
        visible={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title={editingConfig ? 'Editar configuración' : 'Nueva configuración'}
        height="40%"
      >
        <Input
          label="Nombre de la configuración"
          value={configName}
          onChangeText={setConfigName}
          placeholder="Ej: Ingredientes, Extras, Escarchado"
          icon="📋"
        />
        <View style={styles.suggestionsRow}>
          {['Ingredientes', 'Extras', 'Escarchado', 'Salsa', 'Queso', 'Proteína', 'Topping'].map(s => (
            <TouchableOpacity
              key={s}
              style={styles.suggestionChip}
              onPress={() => setConfigName(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button title="Guardar" onPress={handleSaveConfig} fullWidth size="lg" />
      </BottomModal>

      {/* Option Modal */}
      <BottomModal
        visible={showOptionModal}
        onClose={() => setShowOptionModal(false)}
        title={editingOption ? 'Editar opción' : 'Nueva opción'}
        height="55%"
      >
        <Input
          label="Nombre"
          value={optionName}
          onChangeText={setOptionName}
          placeholder="Ej: Queso, Tocino, Sal..."
          icon="📝"
        />
        <Input
          label="Precio extra"
          value={optionPrice}
          onChangeText={setOptionPrice}
          placeholder="0"
          keyboardType="numeric"
          icon="💰"
        />
        <View style={styles.defaultSection}>
          <Text style={styles.defaultSectionTitle}>¿Seleccionado por default?</Text>
          <Text style={styles.defaultSectionDesc}>
            Si está activado, esta opción vendrá preseleccionada cuando el mesero agregue el producto.
          </Text>
          <TouchableOpacity
            style={[styles.defaultBigToggle, optionDefault && styles.defaultBigToggleActive]}
            onPress={() => setOptionDefault(!optionDefault)}
          >
            <View style={[styles.defaultBigCheck, optionDefault && styles.defaultBigCheckActive]}>
              {optionDefault && <Text style={styles.defaultBigCheckmark}>✓</Text>}
            </View>
            <Text style={[styles.defaultBigLabel, optionDefault && styles.defaultBigLabelActive]}>
              {optionDefault ? 'Sí, viene por default' : 'No, es opcional'}
            </Text>
          </TouchableOpacity>
        </View>
        <Button title="Guardar" onPress={handleSaveOption} fullWidth size="lg" />
      </BottomModal>

      {/* Delete Config Confirmation */}
      <ConfirmDialog
        visible={!!deleteConfigId}
        title="Eliminar configuración"
        message="Se eliminarán todas las opciones de esta configuración. ¿Continuar?"
        onConfirm={handleDeleteConfig}
        onCancel={() => setDeleteConfigId(null)}
        confirmText="Eliminar"
        destructive
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
  backBtn: { paddingVertical: 4 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  headerCenter: { alignItems: 'center' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  subtitle: { color: Colors.primary, fontSize: 13, fontWeight: '500' },
  content: { padding: 20 },
  summaryCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryEmoji: { fontSize: 36 },
  summaryName: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  summaryPrice: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoIcon: { fontSize: 20 },
  infoText: { color: Colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 19 },
  emptyConfigCard: { alignItems: 'center', paddingVertical: 32 },
  emptyConfigIcon: { fontSize: 40, marginBottom: 8 },
  emptyConfigText: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  emptyConfigSubtext: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 },
  configCard: { marginBottom: 16 },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  configTitleRow: { flex: 1 },
  configName: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  configCount: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  configActions: { flexDirection: 'row', gap: 8 },
  configActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  configActionText: { fontSize: 14 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  defaultToggle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultToggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  defaultCheck: { color: Colors.textInverse, fontSize: 14, fontWeight: '800' },
  optionName: { color: Colors.textSecondary, fontSize: 15, fontWeight: '500' },
  optionNameDefault: { color: Colors.text, fontWeight: '600' },
  defaultLabel: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  optionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionPrice: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  optionEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionDeleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.dangerBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionEditText: { fontSize: 12, color: Colors.textMuted },
  addOptionBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addOptionText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  suggestionText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  defaultSection: { marginBottom: 20 },
  defaultSectionTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  defaultSectionDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  defaultBigToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: Colors.bgInput,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  defaultBigToggleActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  defaultBigCheck: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultBigCheckActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  defaultBigCheckmark: { color: Colors.textInverse, fontSize: 18, fontWeight: '800' },
  defaultBigLabel: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  defaultBigLabelActive: { color: Colors.primary },
});
