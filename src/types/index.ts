// ==================== TIPOS BASE ====================

export type UserRole = 'admin' | 'mesero' | 'cocina' | 'barra';

export type ProductType = 'cocina' | 'bebida';

export type OrderStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';

export type TableStatus = 'disponible' | 'ocupada' | 'cuenta';

// ==================== USUARIO ====================

export interface User {
  id: string;
  name: string;
  email: string;
  pin: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
  createdAt: string;
}

// ==================== PRODUCTO ====================

export interface ConfigOption {
  id: string;
  name: string;
  extraPrice: number;
  isDefault: boolean;
  order: number;
}

export interface ProductConfig {
  id: string;
  name: string;
  options: ConfigOption[];
  order: number;
  /** Si es solo para cierto tipo de producto */
  appliesTo?: ProductType;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  type: ProductType;
  category: string;
  configs: ProductConfig[];
  active: boolean;
  createdAt: string;
}

// ==================== CATEGORÍA ====================

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: ProductType;
  order: number;
}

// ==================== PEDIDO ====================

export interface OrderItemOption {
  configId: string;
  configName: string;
  optionId: string;
  optionName: string;
  extraPrice: number;
  isSelected: boolean;
  wasDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productType: ProductType;
  basePrice: number;
  quantity: number;
  options: OrderItemOption[];
  notes: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  total: number;
  tip: number;
  paymentMethod?: 'efectivo' | 'tarjeta' | 'transferencia';
  createdAt: string;
  closedAt?: string;
}

// ==================== MESA ====================

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  zone: string;
}

// ==================== INVENTARIO ====================

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  stock: number;
  minStock: number;
  unit: string;
  lastUpdated: string;
}

// ==================== REPORTES ====================

export interface DailySummary {
  date: string;
  totalOrders: number;
  totalSales: number;
  averageTicket: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  ordersByHour: { hour: number; count: number }[];
}

// ==================== NAVEGACIÓN ====================

export type RootStackParamList = {
  Login: undefined;
  AdminDashboard: undefined;
  AdminProducts: undefined;
  AdminProductForm: { productId?: string };
  AdminProductConfig: { productId: string };
  AdminCategories: undefined;
  AdminUsers: undefined;
  AdminUserForm: { userId?: string };
  AdminTables: undefined;
  AdminInventory: undefined;
  AdminReports: undefined;
  WaiterTabs: undefined;
  WaiterPOS: undefined;
  WaiterTable: { tableId: string };
  WaiterOrder: { tableId: string; orderId?: string };
  WaiterBill: { orderId: string };
  KitchenView: undefined;
  BarView: undefined;
};
