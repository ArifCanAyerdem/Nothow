import { Link, useRouter } from 'expo-router';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import * as LocalAuthentication from 'expo-local-authentication';
import { BlurView } from 'expo-blur';
import { Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const router = useRouter();
  const { unlockVault } = useVaultStore();
  const [password, setPassword] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(true);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
    
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    // If password is provided, use it
    if (password.length > 0) {
      if (unlockVault(password)) {
        router.replace('/home');
      } else {
        Alert.alert('Erişim Reddedildi', 'Hatalı ana şifre. (İpucu: 1234)');
      }
      return;
    }

    // Try Biometrics if supported and enabled
    if (useBiometrics && isBiometricSupported) {
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Kasa kilidini aç',
        fallbackLabel: 'Şifre Kullan',
      });

      if (auth.success) {
        setAuthStatus('success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          unlockVault('1234');
          router.replace('/home');
        }, 800);
      } else {
        setAuthStatus('error');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(() => setAuthStatus('idle'), 2000);
      }
    } else {
      Alert.alert('Bilgi Eksik', 'Lütfen şifre girin.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Decorative Background Elements for Glassmorphism */}
          <View style={[styles.bgGlow, { top: -50, left: -50, backgroundColor: 'rgba(255, 107, 0, 0.15)' }]} />
          <View style={[styles.bgGlow, { bottom: 100, right: -100, backgroundColor: 'rgba(0, 150, 255, 0.1)' }]} />

          {/* Top Section */}
          <View style={styles.topSection}>
            <View style={styles.logoBadgeContainer}>
              <View style={styles.shieldIcon} />
              <Text style={styles.secureBadge}>AES-256 ŞİFRELİ</Text>
            </View>
            <Text style={styles.brandTitle}>NOTHOW HUB</Text>
            
            <Text style={styles.headline}>Kasanıza Erişin</Text>
            <Text style={styles.subHeadline}>
              Sıfır bilgi mimarisi ile korunan güvenli alanınıza girmek için kimliğinizi doğrulayın.
            </Text>
          </View>

          {/* Form Fields wrapped in BlurView */}
          <BlurView intensity={40} tint="light" style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Kasa Kimliği</Text>
              <TextInput 
                style={styles.input} 
                placeholder="isim@vault.com" 
                placeholderTextColor={Colors.light.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordHeader}>
                <Text style={styles.inputLabel}>Ana Şifre</Text>
                <Pressable><Text style={styles.forgotText}>Şifremi Unuttum?</Text></Pressable>
              </View>
              <TextInput 
                style={styles.input} 
                placeholder="••••••••••••" 
                placeholderTextColor={Colors.light.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {isBiometricSupported && (
              <View style={styles.biometricPulseWrapper}>
                <Animated.View style={[
                  styles.pulseRing, 
                  { transform: [{ scale: pulseAnim }] },
                  authStatus === 'success' && { borderColor: Colors.light.success },
                  authStatus === 'error' && { borderColor: Colors.light.error }
                ]} />
                <TouchableOpacity style={[
                  styles.biometricBtnInner,
                  authStatus === 'success' && { backgroundColor: Colors.light.success },
                  authStatus === 'error' && { backgroundColor: Colors.light.error }
                ]} onPress={handleLogin}>
                  <Text style={{fontSize: 24}}>{authStatus === 'success' ? '✅' : authStatus === 'error' ? '❌' : '👆'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Primary CTA */}
            {!isBiometricSupported && (
              <TouchableOpacity style={styles.signInButton} onPress={handleLogin} activeOpacity={0.8}>
                <Text style={styles.signInText}>Kasaya Giriş Yap →</Text>
              </TouchableOpacity>
            )}
          </BlurView>

          {/* Social SSO */}
          <View style={styles.ssoSection}>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={styles.ssoButtonApple}>
              <Text style={styles.ssoButtonTextApple}>Continue with Apple</Text>
            </Pressable>
            <Pressable style={styles.ssoButtonGoogle}>
              <Text style={styles.ssoButtonTextGoogle}>Continue with Google</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footerSection}>
            <View style={styles.createAccountContainer}>
              <Text style={styles.footerText}>Don't have a vault account? </Text>
              <Pressable><Text style={styles.createAccountText}>Create an Account</Text></Pressable>
            </View>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeText}>🛡️ Protected by Hardware Enclave & Zero-Knowledge Architecture</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,
  },
  bgGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  topSection: {
    marginBottom: Spacing.five,
  },
  logoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  shieldIcon: {
    width: 20,
    height: 20,
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  secureBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.success,
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subHeadline: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  formSection: {
    gap: Spacing.four,
    marginBottom: Spacing.five,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
  },
  biometricPulseWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    height: 100,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.4)',
  },
  biometricBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  signInButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  ssoSection: {
    gap: 16,
    marginBottom: Spacing.five,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  ssoButtonApple: {
    backgroundColor: Colors.light.text,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ssoButtonTextApple: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
  ssoButtonGoogle: {
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ssoButtonTextGoogle: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
  footerSection: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: 16,
  },
  createAccountContainer: {
    flexDirection: 'row',
  },
  footerText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  createAccountText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  trustBadge: {
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  trustBadgeText: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
