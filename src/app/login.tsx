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
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { unlockVault, unlockWithBiometrics, initStore, isBiometricsEnabled, userPin, userName } = useVaultStore();
  const [password, setPassword] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (async () => {
      await initStore();
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
    
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
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
        Alert.alert('Erişim Reddedildi', 'Hatalı ana şifre.');
      }
      return;
    }

    // Try Biometrics if supported and enabled
    if (isBiometricsEnabled && isBiometricSupported) {
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Kasa kilidini aç',
        fallbackLabel: 'Şifre Kullan',
      });

      if (auth.success) {
        setAuthStatus('success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          unlockWithBiometrics();
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
          {/* Decorative Background Elements */}
          <View style={[styles.bgGlow, { top: -50, left: -50, backgroundColor: 'rgba(255, 107, 0, 0.08)' }]} />
          <View style={[styles.bgGlow, { bottom: 100, right: -100, backgroundColor: 'rgba(0, 150, 255, 0.05)' }]} />

          {/* Top Section */}
          <View style={styles.topSection}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
            </TouchableOpacity>

            <View style={styles.logoBadgeContainer}>
              <View style={styles.shieldIcon}>
                <MaterialIcons name="security" size={14} color="#fff" />
              </View>
              <Text style={styles.brandTitle}>NOTHOW HUB</Text>
            </View>
            
            <Text style={styles.headline}>Kasanıza Erişin</Text>
            <Text style={styles.subHeadline}>
              Hoş geldin{userName ? `, ${userName}` : ''}. Güvenli alanına girmek için kimliğini doğrula.
            </Text>
          </View>

          {/* Form Fields wrapped in BlurView */}
          <BlurView intensity={40} tint="light" style={styles.formSection}>
            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>Ana Şifre (PIN)</Text>
              </View>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="••••••••••••" 
                  placeholderTextColor={Colors.light.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  keyboardType="number-pad"
                  selectionColor={Colors.light.primary}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>
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
                  {authStatus === 'success' ? (
                    <MaterialIcons name="check" size={28} color="#fff" />
                  ) : authStatus === 'error' ? (
                    <MaterialIcons name="close" size={28} color="#fff" />
                  ) : (
                    <MaterialIcons name="fingerprint" size={32} color={Colors.light.primary} />
                  )}
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

          {/* Footer */}
          <View style={styles.footerSection}>
            <View style={styles.createAccountContainer}>
              <Text style={styles.footerText}>Kasanız yok mu? </Text>
              <Pressable onPress={() => router.replace('/register')}>
                <Text style={styles.createAccountText}>Yeni Kasa Oluştur</Text>
              </Pressable>
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
    paddingTop: Spacing.four,
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
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginLeft: -8,
  },
  logoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  shieldIcon: {
    width: 24,
    height: 24,
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subHeadline: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  formSection: {
    gap: Spacing.four,
    marginBottom: Spacing.five,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  biometricPulseWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    height: 100,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 0, 0.4)',
  },
  biometricBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerSection: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: 16,
  },
  createAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
