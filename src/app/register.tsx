import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function RegisterScreen() {
  const router = useRouter();
  const { setUserName, setPin, unlockVault } = useVaultStore();

  const [name, setName] = useState('');
  const [pin, setPinState] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleSetup = async () => {
    if (!name.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen adınızı girin.');
      return;
    }
    if (pin.length < 4) {
      Alert.alert('Geçersiz Şifre', 'Şifreniz en az 4 haneli olmalıdır.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    try {
      await setUserName(name.trim());
      await setPin(pin);
      // Automatically unlock vault for the new user
      unlockVault(pin);
      router.replace('/home');
    } catch (e) {
      Alert.alert('Hata', 'Kasa oluşturulurken bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Light Background Elements */}
      <View style={[styles.bgGlow, { top: -100, left: -100, backgroundColor: 'rgba(255, 107, 0, 0.08)' }]} />
      <View style={[styles.bgGlow, { bottom: -100, right: -100, backgroundColor: 'rgba(0, 150, 255, 0.05)' }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="security" size={28} color={Colors.light.primary} />
            </View>
            <Text style={styles.title}>Kasanı Oluştur</Text>
            <Text style={styles.subtitle}>Sıfır bilgi mimarisi ile verilerin sadece bu cihazda şifrelenecek. Buluta asla gönderilmeyecek.</Text>
          </View>

          <BlurView intensity={40} tint="light" style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adınız veya Lakabınız</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person-outline" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="Örn: Arif"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCorrect={false}
                  selectionColor={Colors.light.primary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ana Kasa Şifresi (PIN)</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="En az 4 hane"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={pin}
                  onChangeText={setPinState}
                  keyboardType="number-pad"
                  secureTextEntry={!showPin}
                  selectionColor={Colors.light.primary}
                />
                <TouchableOpacity onPress={() => setShowPin(!showPin)} style={styles.eyeIcon}>
                  <MaterialIcons name={showPin ? "visibility" : "visibility-off"} size={20} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifreyi Doğrula</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="Şifreyi tekrar girin"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  keyboardType="number-pad"
                  secureTextEntry={!showPin}
                  selectionColor={Colors.light.primary}
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <MaterialIcons name="error-outline" size={20} color={Colors.light.error} />
              <Text style={styles.infoText}>
                Bu şifre unutulursa, kasanıza ve içerisindeki verilere bir daha asla erişemezsiniz. Kurtarma seçeneği yoktur.
              </Text>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSetup} activeOpacity={0.8}>
              <Text style={styles.submitBtnText}>Kasayı Kur ve Başla</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </BlurView>
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
  bgGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  header: {
    marginBottom: 32,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  formSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.1)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.light.error,
    lineHeight: 18,
    fontWeight: '500',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  }
});
