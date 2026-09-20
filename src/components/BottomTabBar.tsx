import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

interface BottomTabBarProps {
  activeRoute: 'home' | 'plan' | 'notes' | 'vault' | 'profile';
}

export function BottomTabBar({ activeRoute }: BottomTabBarProps) {
  const router = useRouter();

  const handleSoon = () => Alert.alert('Çok Yakında', 'Bu özellik henüz aktif değil.');

  const renderTab = (route: BottomTabBarProps['activeRoute'], icon: keyof typeof MaterialIcons.glyphMap, label: string, action: () => void) => {
    const isActive = activeRoute === route;
    return (
      <TouchableOpacity style={styles.tabItem} onPress={isActive ? undefined : action} activeOpacity={0.7}>
        <MaterialIcons 
          name={icon} 
          size={24} 
          color={isActive ? Colors.light.primaryContainer : Colors.light.textSecondary} 
        />
        <Text style={isActive ? styles.tabLabelActive : styles.tabLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBarWrapper}>
      <BlurView intensity={80} tint="light" style={styles.tabBarContainer}>
        {renderTab('home', 'home', 'Ana Sayfa', () => router.replace('/home'))}
        {renderTab('plan', 'calendar-today', 'Plan', () => router.replace('/plan'))}
        {renderTab('notes', 'description', 'Notlar', () => router.replace('/notes'))}
        {renderTab('vault', 'lock', 'Kasa', () => router.replace('/vault'))}
        {renderTab('profile', 'person', 'Profil', () => router.replace('/profile'))}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 249, 246, 0.7)',
    height: 70,
    borderRadius: 35,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.primaryContainer,
    marginTop: 2,
  },
});
