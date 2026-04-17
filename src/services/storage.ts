import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Category, User, Table, Order, OrderItem, InventoryItem, DailySummary } from '../types';
import { seedData } from './seedData';

const KEYS = {
  PRODUCTS: '@resto_products',
  CATEGORIES: '@resto_categories',
  USERS: '@resto_users',
  TABLES: '@resto_tables',
  ORDERS: '@resto_orders',
  INVENTORY: '@resto_inventory',
  CURRENT_USER: '@resto_current_user',
  INITIALIZED: '@resto_initialized',
};

// ==================== HELPER ====================

async function getItem<T>(key: string): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return [];
  }
}

async function setItem<T>(key: string, data: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
  }
}

// ==================== INIT ====================

export async function initializeStorage(): Promise<void> {
  try {
    const initialized = await AsyncStorage.getItem(KEYS.INITIALIZED);
    if (!initialized) {
      await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(seedData.products));
      await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(seedData.categories));
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(seedData.users));
      await AsyncStorage.setItem(KEYS.TABLES, JSON.stringify(seedData.tables));
      await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(seedData.orders));
      await AsyncStorage.setItem(KEYS.INVENTORY, JSON.stringify(seedData.inventory));
      await AsyncStorage.setItem(KEYS.INITIALIZED, 'true');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

export async function resetStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
    await initializeStorage();
  } catch (error) {
    console.error('Error resetting storage:', error);
  }
}

// ==================== PRODUCTS ====================

export async function getProducts(): Promise<Product[]> {
  return getItem<Product>(KEYS.PRODUCTS);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find(p => p.id === id);
}

export async function saveProduct(product: Product): Promise<void> {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  await setItem(KEYS.PRODUCTS, products);
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await getProducts();
  await setItem(KEYS.PRODUCTS, products.filter(p => p.id !== id));
}

// ==================== CATEGORIES ====================

export async function getCategories(): Promise<Category[]> {
  return getItem<Category>(KEYS.CATEGORIES);
}

export async function saveCategory(category: Category): Promise<void> {
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  if (index >= 0) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  await setItem(KEYS.CATEGORIES, categories);
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = await getCategories();
  await setItem(KEYS.CATEGORIES, categories.filter(c => c.id !== id));
}

// ==================== USERS ====================

export async function getUsers(): Promise<User[]> {
  return getItem<User>(KEYS.USERS);
}

export async function getUser(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find(u => u.id === id);
}

export async function saveUser(user: User): Promise<void> {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  await setItem(KEYS.USERS, users);
}

export async function deleteUser(id: string): Promise<void> {
  const users = await getUsers();
  await setItem(KEYS.USERS, users.filter(u => u.id !== id));
}

export async function loginUser(pin: string): Promise<User | null> {
  const users = await getUsers();
  const user = users.find(u => u.pin === pin && u.active);
  if (user) {
    await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.CURRENT_USER);
}

// ==================== TABLES ====================

export async function getTables(): Promise<Table[]> {
  return getItem<Table>(KEYS.TABLES);
}

export async function getTable(id: string): Promise<Table | undefined> {
  const tables = await getTables();
  return tables.find(t => t.id === id);
}

export async function saveTable(table: Table): Promise<void> {
  const tables = await getTables();
  const index = tables.findIndex(t => t.id === table.id);
  if (index >= 0) {
    tables[index] = table;
  } else {
    tables.push(table);
  }
  await setItem(KEYS.TABLES, tables);
}

export async function updateTableStatus(id: string, status: Table['status'], orderId?: string): Promise<void> {
  const tables = await getTables();
  const index = tables.findIndex(t => t.id === id);
  if (index >= 0) {
    tables[index].status = status;
    if (orderId !== undefined) tables[index].currentOrderId = orderId;
    await setItem(KEYS.TABLES, tables);
  }
}

// ==================== ORDERS ====================

export async function getOrders(): Promise<Order[]> {
  return getItem<Order>(KEYS.ORDERS);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const orders = await getOrders();
  return orders.find(o => o.id === id);
}

export async function getActiveOrders(): Promise<Order[]> {
  const orders = await getOrders();
  return orders.filter(o => o.status !== 'entregado' && o.status !== 'cancelado');
}

export async function getKitchenOrders(): Promise<Order[]> {
  const orders = await getOrders();
  return orders.filter(o => {
    return o.items.some(item =>
      item.productType === 'cocina' &&
      (item.status === 'pendiente' || item.status === 'preparando')
    );
  });
}

export async function getBarOrders(): Promise<Order[]> {
  const orders = await getOrders();
  return orders.filter(o => {
    return o.items.some(item =>
      item.productType === 'bebida' &&
      (item.status === 'pendiente' || item.status === 'preparando')
    );
  });
}

export async function saveOrder(order: Order): Promise<void> {
  const orders = await getOrders();
  const index = orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.push(order);
  }
  await setItem(KEYS.ORDERS, orders);
}

export async function updateOrderItemStatus(orderId: string, itemId: string, status: OrderItem['status']): Promise<void> {
  const orders = await getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex >= 0) {
    const itemIndex = orders[orderIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex >= 0) {
      orders[orderIndex].items[itemIndex].status = status;
      // Check if all items are done
      const allDone = orders[orderIndex].items.every(i => i.status === 'listo' || i.status === 'entregado' || i.status === 'cancelado');
      if (allDone) {
        orders[orderIndex].status = 'listo';
      }
      await setItem(KEYS.ORDERS, orders);
    }
  }
}

// ==================== INVENTORY ====================

export async function getInventory(): Promise<InventoryItem[]> {
  return getItem<InventoryItem>(KEYS.INVENTORY);
}

export async function saveInventoryItem(item: InventoryItem): Promise<void> {
  const inventory = await getInventory();
  const index = inventory.findIndex(i => i.id === item.id);
  if (index >= 0) {
    inventory[index] = item;
  } else {
    inventory.push(item);
  }
  await setItem(KEYS.INVENTORY, inventory);
}

// ==================== REPORTS ====================

export async function getDailySummary(): Promise<DailySummary> {
  const orders = await getOrders();
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt.startsWith(today));

  const totalSales = todayOrders.reduce((sum, o) => sum + o.total, 0);

  // Top products
  const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  todayOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productMap[item.productId]) {
        productMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
      }
      productMap[item.productId].quantity += item.quantity;
      productMap[item.productId].revenue += item.totalPrice;
    });
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Orders by hour
  const hourMap: Record<number, number> = {};
  for (let i = 8; i <= 23; i++) hourMap[i] = 0;
  todayOrders.forEach(o => {
    const hour = new Date(o.createdAt).getHours();
    hourMap[hour] = (hourMap[hour] || 0) + 1;
  });
  const ordersByHour = Object.entries(hourMap).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
  }));

  return {
    date: today,
    totalOrders: todayOrders.length,
    totalSales,
    averageTicket: todayOrders.length > 0 ? totalSales / todayOrders.length : 0,
    topProducts,
    ordersByHour,
  };
}

