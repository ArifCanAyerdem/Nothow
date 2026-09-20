import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBar } from '@/components/BottomTabBar';
import { useVaultStore } from '@/store/vaultStore';
import { useEffect, useRef } from 'react';
import { BlurView } from 'expo-blur';
import { AnimatedCard } from '@/components/AnimatedCard';

export default function ProfileScreen() {
  const router = useRouter();
  const { items } = useVaultStore();
  
  const passwordsCount = items.filter(i => i.type === 'password').length;
  const tasksCompleted = items.filter(i => i.type === 'task' && i.isCompleted).length;
  const notesCount = items.filter(i => i.type === 'note').length;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogoIcon}>👤</Text>
          <View>
            <Text style={styles.headerSubtitle}>NOTHOW HUB</Text>
            <Text style={styles.headerTitle}>Profil</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card with Glassmorphism */}
        <Animated.View style={[styles.profileHeader, { transform: [{ scale: pulseAnim }] }]}>
          <BlurView intensity={80} tint="light" style={styles.profileGlass}>
            <View style={styles.largeAvatar}>
              <Text style={{color: '#fff', fontSize: 36, fontWeight: '700'}}>A</Text>
            </View>
            <View style={styles.proBadge}>
              <MaterialIcons name="verified" size={14} color="#fff" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
            <Text style={styles.profileName}>Arif C.</Text>
            <Text style={styles.profileEmail}>arif@kinetic.vault</Text>
          </BlurView>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <AnimatedCard style={styles.statCard} onPress={() => {}}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(255, 107, 43, 0.1)' }]}>
              <MaterialIcons name="vpn-key" size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.statValue}>{passwordsCount}</Text>
            <Text style={styles.statLabel}>Şifreler</Text>
          </AnimatedCard>
          
          <AnimatedCard style={styles.statCard} onPress={() => {}}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{tasksCompleted}</Text>
            <Text style={styles.statLabel}>Biten Görev</Text>
          </AnimatedCard>
          
          <AnimatedCard style={styles.statCard} onPress={() => {}}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
              <MaterialIcons name="description" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{notesCount}</Text>
            <Text style={styles.statLabel}>Notlar</Text>
          </AnimatedCard>
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Güvenlik ve Kasa</Text>
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: 'rgba(255, 107, 43, 0.1)'}]}>
                <MaterialIcons name="lock" size={20} color={Colors.light.primary} />
              </View>
              <View style={{marginLeft: 12}}>
                <Text style={styles.settingText}>Ana Şifreyi Değiştir</Text>
                <Text style={styles.settingSubtext}>Son değişim: 2 ay önce</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: 'rgba(156, 39, 176, 0.1)'}]}>
                <MaterialIcons name="fingerprint" size={20} color="#9c27b0" />
              </View>
              <View style={{marginLeft: 12}}>
                <Text style={styles.settingText}>Biyometrik Giriş</Text>
                <Text style={styles.settingSubtext}>Face ID / Touch ID Aktif</Text>
              </View>
            </View>
            <View style={styles.activeToggle}>
              <View style={styles.activeToggleKnob} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: 'rgba(33, 150, 243, 0.1)'}]}>
                <MaterialIcons name="notifications" size={20} color="#2196F3" />
              </View>
              <Text style={styles.settingText}>Bildirim Tercihleri</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => router.replace('/login')} activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: 'rgba(244, 67, 54, 0.1)'}]}>
                <MaterialIcons name="logout" size={20} color={Colors.light.error} />
              </View>
              <Text style={[styles.settingText, { color: Colors.light.error }]}>Kasayı Kilitle & Çık</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomTabBar activeRoute="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    height: 64,
    backgroundColor: 'rgba(250, 249, 246, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoIcon: {
    fontSize: 24,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    lineHeight: 24,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: 16,
    paddingBottom: 120, 
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileGlass: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    width: '100%',
  },
  largeAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: -16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.light.surfaceContainerLowest,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.surfaceContainer,
  },
  settingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 12,
  },
  settingSubtext: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  activeToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  activeToggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  }
});
