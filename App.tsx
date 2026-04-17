import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from './src/theme/colors';
import { initializeStorage, logoutUser, getCurrentUser } from './src/services/storage';
import { User } from './src/types';

// Screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { AdminDashboard } from './src/screens/admin/AdminDashboard';
import { AdminProducts } from './src/screens/admin/AdminProducts';
import { AdminProductForm } from './src/screens/admin/AdminProductForm';
import { AdminProductConfig } from './src/screens/admin/AdminProductConfig';
import { AdminUsers } from './src/screens/admin/AdminUsers';
import { AdminTables } from './src/screens/admin/AdminTables';
import { AdminInventory } from './src/screens/admin/AdminInventory';
import { AdminReports } from './src/screens/admin/AdminReports';
import { WaiterPOS } from './src/screens/waiter/WaiterPOS';
import { WaiterBill } from './src/screens/waiter/WaiterBill';
import { KitchenView } from './src/screens/kitchen/KitchenView';
import { BarView } from './src/screens/bar/BarView';

type Screen =
  | { name: 'Login' }
  | { name: 'AdminDashboard' }
  | { name: 'AdminProducts' }
  | { name: 'AdminProductForm'; productId?: string }
  | { name: 'AdminProductConfig'; productId: string }
  | { name: 'AdminUsers' }
  | { name: 'AdminTables' }
  | { name: 'AdminInventory' }
  | { name: 'AdminReports' }
  | { name: 'WaiterPOS' }
  | { name: 'WaiterBill'; orderId: string }
  | { name: 'KitchenView' }
  | { name: 'BarView' };

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'Login' });
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await initializeStorage();
    const savedUser = await getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      navigateToHome(savedUser);
    }
    setLoading(false);
  };

  const navigateToHome = (u: User) => {
    switch (u.role) {
      case 'admin': navigate({ name: 'AdminDashboard' }); break;
      case 'mesero': navigate({ name: 'WaiterPOS' }); break;
      case 'cocina': navigate({ name: 'KitchenView' }); break;
      case 'barra': navigate({ name: 'BarView' }); break;
    }
  };

  const navigate = (s: Screen) => {
    setScreenHistory(prev => [...prev, screen]);
    setScreen(s);
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory(h => h.slice(0, -1));
      setScreen(prev);
    }
  };

  const handleLogin = (u: User) => {
    setUser(u);
    navigateToHome(u);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setScreen({ name: 'Login' });
    setScreenHistory([]);
  };

  const handleAdminNavigate = (screenName: string) => {
    switch (screenName) {
      case 'AdminProducts': navigate({ name: 'AdminProducts' }); break;
      case 'AdminUsers': navigate({ name: 'AdminUsers' }); break;
      case 'AdminTables': navigate({ name: 'AdminTables' }); break;
      case 'AdminInventory': navigate({ name: 'AdminInventory' }); break;
      case 'AdminReports': navigate({ name: 'AdminReports' }); break;
      case 'WaiterPOS': navigate({ name: 'WaiterPOS' }); break;
      case 'KitchenView': navigate({ name: 'KitchenView' }); break;
      case 'BarView': navigate({ name: 'BarView' }); break;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando RestoMX...</Text>
      </View>
    );
  }

  const renderScreen = () => {
    switch (screen.name) {
      case 'Login':
        return <LoginScreen onLogin={handleLogin} />;

      case 'AdminDashboard':
        return (
          <AdminDashboard
            user={user!}
            onNavigate={handleAdminNavigate}
            onLogout={handleLogout}
          />
        );

      case 'AdminProducts':
        return (
          <AdminProducts
            onBack={goBack}
            onEdit={(productId) => navigate({ name: 'AdminProductForm', productId })}
            onConfig={(productId) => navigate({ name: 'AdminProductConfig', productId })}
          />
        );

      case 'AdminProductForm':
        return (
          <AdminProductForm
            productId={screen.productId}
            onBack={goBack}
            onSaved={() => {
              goBack();
            }}
          />
        );

      case 'AdminProductConfig':
        return (
          <AdminProductConfig
            productId={screen.productId}
            onBack={goBack}
          />
        );

      case 'AdminUsers':
        return <AdminUsers onBack={goBack} />;

      case 'AdminTables':
        return <AdminTables onBack={goBack} />;

      case 'AdminInventory':
        return <AdminInventory onBack={goBack} />;

      case 'AdminReports':
        return <AdminReports onBack={goBack} />;

      case 'WaiterPOS':
        return (
          <WaiterPOS
            user={user!}
            onBack={user?.role === 'admin' ? goBack : handleLogout}
            onBill={(orderId) => navigate({ name: 'WaiterBill', orderId })}
          />
        );

      case 'WaiterBill':
        return (
          <WaiterBill
            orderId={screen.orderId}
            onBack={goBack}
            onPaid={goBack}
          />
        );

      case 'KitchenView':
        return <KitchenView onBack={user?.role === 'admin' ? goBack : handleLogout} />;

      case 'BarView':
        return <BarView onBack={user?.role === 'admin' ? goBack : handleLogout} />;

      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});
