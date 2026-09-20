import { Colors, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function OnboardingScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Glow Backgrounds */}
      <View style={[styles.bgGlow, { top: -100, left: -50, backgroundColor: 'rgba(255, 107, 0, 0.08)' }]} />
      <View style={[styles.bgGlow, { top: '30%', right: -150, backgroundColor: 'rgba(0, 150, 255, 0.05)' }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.logoBadgeContainer}>
            <View style={styles.shieldIcon}>
              <MaterialIcons name="security" size={14} color="#fff" />
            </View>
            <Text style={styles.brandText}>NOTHOW HUB</Text>
          </View>
          <Pressable style={styles.skipButton}>
            <Text style={styles.skipText}>TR ▾</Text>
          </Pressable>
        </View>

        {/* Hero Visual Area */}
        <View style={styles.heroContainer}>
          <BlurView intensity={40} tint="light" style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <MaterialIcons name="enhanced-encryption" size={64} color={Colors.light.primary} />
            </View>
          </BlurView>
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          <Text style={styles.kicker}>YENİ NESİL ŞİFRELİ ALAN</Text>
          <Text style={styles.headline}>Zihnini Güvenceye Al.</Text>
          <Text style={styles.subtext}>
            Düşüncelerini yakala, görevlerini organize et ve en hassas şifrelerini cihazında barınan sıfır-bilgi kasanla koru.
          </Text>

          {/* Features list */}
          <View style={styles.featuresList}>
            <View style={styles.featureChip}>
              <MaterialIcons name="visibility-off" size={14} color={Colors.light.primary} style={{marginRight: 6}} />
              <Text style={styles.featureText}>Sıfır Bilgi</Text>
            </View>
            <View style={styles.featureChip}>
              <MaterialIcons name="bolt" size={14} color={Colors.light.primary} style={{marginRight: 6}} />
              <Text style={styles.featureText}>Hızlı Erişim</Text>
            </View>
            <View style={styles.featureChip}>
              <MaterialIcons name="fingerprint" size={14} color={Colors.light.primary} style={{marginRight: 6}} />
              <Text style={styles.featureText}>Cihaz İçi Kilit</Text>
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/register')} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Kasayı Kur ve Başla →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostButton} onPress={() => router.push('/login')} activeOpacity={0.6}>
            <Text style={styles.ghostButtonText}>Zaten bir kasam var</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  bgGlow: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  logoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldIcon: {
    width: 24,
    height: 24,
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
    color: Colors.light.text,
  },
  skipButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  skipText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '700',
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    minHeight: 280,
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
  },
  iconCircleOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.1)',
    overflow: 'hidden',
  },
  iconCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.2)',
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 16,
    lineHeight: 44,
    letterSpacing: -1,
  },
  subtext: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerHigh || '#efeeeb',
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  bottomActions: {
    paddingHorizontal: Spacing.four,
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  ghostButton: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 16,
  },
  ghostButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
