import { Link, useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.brandText}>KINETIC VAULT</Text>
          <Pressable style={styles.skipButton}>
            <Text style={styles.skipText}>EN ▾</Text>
          </Pressable>
        </View>

        {/* Hero Visual Area */}
        <View style={styles.heroContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>Vault 3D Graphic</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AES-256 GCM • HARDWARE ENCLAVE</Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          <Text style={styles.kicker}>NEXT-GEN ENCRYPTED WORKSPACE</Text>
          <Text style={styles.headline}>Your Mind, Secured.</Text>
          <Text style={styles.subtext}>
            Capture thoughts, organize tasks, and lock sensitive keys in a zero-knowledge biometric vault designed for high-performance minds.
          </Text>
          
          {/* Features list */}
          <View style={styles.featuresList}>
            <View style={styles.featureChip}><Text style={styles.featureText}>🔐 Zero-Knowledge</Text></View>
            <View style={styles.featureChip}><Text style={styles.featureText}>⚡ AI Synthesis</Text></View>
            <View style={styles.featureChip}><Text style={styles.featureText}>🛡️ On-Device Keys</Text></View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/register')} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Get Started →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostButton} onPress={() => router.push('/login')} activeOpacity={0.6}>
            <Text style={styles.ghostButtonText}>I already have an account</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms and End-to-End Encryption Policy.
          </Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  brandText: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
    color: Colors.light.text,
  },
  skipButton: {
    padding: 4,
  },
  skipText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    minHeight: 300,
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
  },
  imagePlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  imageText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  badge: {
    marginTop: -20,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light.text,
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
  },
  subtext: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  featureChip: {
    backgroundColor: Colors.light.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  bottomActions: {
    paddingHorizontal: Spacing.four,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    borderRadius: 99,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  ghostButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
