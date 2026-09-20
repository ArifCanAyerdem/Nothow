import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Animated, Modal, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBar } from '@/components/BottomTabBar';
import { useVaultStore } from '@/store/vaultStore';
import { useEffect, useRef, useState } from 'react';
import { BlurView } from 'expo-blur';
import { AnimatedCard } from '@/components/AnimatedCard';

export default function ProfileScreen() {
  const router = useRouter();
  const { items, userPin, setPin, setDecoyPin, isBiometricsEnabled, setBiometricsEnabled, clearAllData, lockVault, userName, autoLockTimer, setAutoLockTimer } = useVaultStore();
  
  const passwordsCount = items.filter(i => i.type === 'password').length;
  const tasksCompleted = items.filter(i => i.type === 'task' && i.isCompleted).length;
  const notesCount = items.filter(i => i.type === 'note').length;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Modal States
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  const [isDecoyModalVisible, setIsDecoyModalVisible] = useState(false);
  const [newDecoyPinInput, setNewDecoyPinInput] = useState('');

  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const submitNewPin = async () => {
    if (newPinInput.length >= 4) {
      await setPin(newPinInput);
      setNewPinInput('');
      setIsPinModalVisible(false);
      Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.');
    } else {
      Alert.alert('Hata', 'Şifre en az 4 haneli olmalı.');
    }
  };

  const submitNewDecoyPin = async () => {
    if (newDecoyPinInput.length < 4) {
      Alert.alert('Hata', 'Sahte şifre en az 4 haneli olmalı.');
      return;
    }
    if (newDecoyPinInput === userPin) {
      Alert.alert('Güvenlik İhlali', 'Sahte şifre ile gerçek şifre aynı olamaz!');
      return;
    }
    await setDecoyPin(newDecoyPinInput);
    setNewDecoyPinInput('');
    setIsDecoyModalVisible(false);
    Alert.alert('Başarılı', 'Sahte kasanız aktif edildi. Giriş ekranında bu şifreyi yazarak temiz bir kasaya ulaşabilirsiniz.');
  };

  const submitReset = async () => {
    if (resetConfirmInput === 'SIFIRLA') {
      setIsResetModalVisible(false);
      setResetConfirmInput('');
      await clearAllData();
      router.replace('/'); // Redirect to Onboarding
    } else {
      Alert.alert('Hata', 'Lütfen kutuya tam olarak SIFIRLA yazın.');
    }
  };

  const toggleBiometrics = () => {
    setBiometricsEnabled(!isBiometricsEnabled);
  };

  const getAutoLockLabel = () => {
    if (autoLockTimer === 0) return 'Anında';
    if (autoLockTimer === 60000) return '1 Dakika';
    if (autoLockTimer === 300000) return '5 Dakika';
    return 'Anında';
  };

  const changeAutoLock = () => {
    Alert.alert('Otomatik Kilit Süresi', 'Uygulama arka plana atıldığında ne kadar süre sonra kilitlensin?', [
      { text: 'Anında', onPress: () => setAutoLockTimer(0) },
      { text: '1 Dakika', onPress: () => setAutoLockTimer(60000) },
      { text: '5 Dakika', onPress: () => setAutoLockTimer(300000) },
      { text: 'İptal', style: 'cancel' }
    ]);
  };

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
              <Text style={{color: '#fff', fontSize: 36, fontWeight: '700'}}>{userName ? userName.charAt(0).toUpperCase() : 'A'}</Text>
            </View>
            <View style={styles.proBadge}>
              <MaterialIcons name="verified" size={14} color="#fff" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
            <Text style={styles.profileName}>{userName || 'Kullanıcı'}</Text>
            <Text style={styles.profileEmail}>{userName ? `${userName.toLowerCase().replace(/\s/g, '')}@kinetic.vault` : 'user@kinetic.vault'}</Text>
          </BlurView>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <AnimatedCard style={styles.statCard} onPress={() => router.push('/vault')}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(255, 107, 43, 0.1)' }]}>
              <MaterialIcons name="vpn-key" size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.statValue}>{passwordsCount}</Text>
            <Text style={styles.statLabel}>Şifreler</Text>
          </AnimatedCard>
          
          <AnimatedCard style={styles.statCard} onPress={() => router.push('/plan')}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{tasksCompleted}</Text>
            <Text style={styles.statLabel}>Biten Görev</Text>
          </AnimatedCard>
          
          <AnimatedCard style={styles.statCard} onPress={() => router.push('/notes')}>
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
          <TouchableOpacity style={styles.settingItem} onPress={() => setIsPinModalVisible(true)} activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: 'rgba(255, 107, 43, 0.1)'}]}>
                <MaterialIcons name="lock" size={20} color={Colors.light.primary} />
              </View>
              <View style={{marginLeft: 12}}>
                <Text style={styles.settingText}>Ana Şifreyi Değiştir</Text>
                <Text style={styles.settingSubtext}>Şifrenizi güvende tutun</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => setIsDecoyModalVisible(true)} activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: 'rgba(244, 67, 54, 0.1)'}]}>
                <MaterialIcons name="security" size={20} color={Colors.light.error} />
              </View>
              <View style={{marginLeft: 12}}>
                <Text style={styles.settingText}>Sahte Kasa Şifresi</Text>
                <Text style={styles.settingSubtext}>Gizli Decoy PIN belirle</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={toggleBiometrics} activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: 'rgba(156, 39, 176, 0.1)'}]}>
                <MaterialIcons name="fingerprint" size={20} color="#9c27b0" />
              </View>
              <View style={{marginLeft: 12}}>
                <Text style={styles.settingText}>Biyometrik Giriş</Text>
                <Text style={styles.settingSubtext}>Face ID / Touch ID</Text>
              </View>
            </View>
            <View style={[styles.activeToggle, !isBiometricsEnabled && { backgroundColor: Colors.light.surfaceContainer }]}>
              <View style={[styles.activeToggleKnob, !isBiometricsEnabled && { alignSelf: 'flex-start', backgroundColor: Colors.light.textSecondary }]} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={changeAutoLock} activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: 'rgba(33, 150, 243, 0.1)'}]}>
                <MaterialIcons name="timer" size={20} color="#2196F3" />
              </View>
              <View style={{marginLeft: 12}}>
                <Text style={styles.settingText}>Otomatik Kilit</Text>
                <Text style={styles.settingSubtext}>Arka planda kalınca</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{color: Colors.light.primary, fontWeight: '600', marginRight: 4}}>{getAutoLockLabel()}</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors.light.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7} onPress={() => Alert.alert('Bildirimler', 'Bildirim tercihleri sistem ayarlarından yönetilmektedir. Ayarlara yönlendiriliyorsunuz... (Simülasyon)')}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: 'rgba(33, 150, 243, 0.1)'}]}>
                <MaterialIcons name="notifications" size={20} color="#2196F3" />
              </View>
              <Text style={styles.settingText}>Bildirim Tercihleri</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => setIsResetModalVisible(true)} activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: 'rgba(244, 67, 54, 0.1)'}]}>
                <MaterialIcons name="delete-forever" size={20} color={Colors.light.error} />
              </View>
              <Text style={[styles.settingText, { color: Colors.light.error }]}>Tüm Verileri Sıfırla (Danger)</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => { lockVault(); router.replace('/login'); }} activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.settingIconBox, {backgroundColor: Colors.light.surfaceContainerHigh}]}>
                <MaterialIcons name="logout" size={20} color={Colors.light.text} />
              </View>
              <Text style={styles.settingText}>Kasayı Kilitle & Çık</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- Change PIN Modal --- */}
      <Modal visible={isPinModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconBox, { backgroundColor: 'rgba(255, 107, 43, 0.1)' }]}>
              <MaterialIcons name="lock-reset" size={28} color={Colors.light.primary} />
            </View>
            <Text style={styles.modalTitle}>Ana Şifreyi Değiştir</Text>
            <Text style={styles.modalDesc}>Yeni kasanız için en az 4 haneli yeni şifrenizi girin.</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Yeni Şifre"
              placeholderTextColor={Colors.light.textSecondary}
              secureTextEntry
              keyboardType="number-pad"
              value={newPinInput}
              onChangeText={setNewPinInput}
              autoFocus
              selectionColor={Colors.light.primary}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setIsPinModalVisible(false); setNewPinInput(''); }}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={submitNewPin}>
                <Text style={styles.modalSubmitText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- Decoy PIN Modal --- */}
      <Modal visible={isDecoyModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconBox, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
              <MaterialIcons name="security" size={28} color={Colors.light.error} />
            </View>
            <Text style={styles.modalTitle}>Sahte Kasa Şifresi</Text>
            <Text style={styles.modalDesc}>Bu şifre ile giriş yaptığınızda, gerçek kasanız yerine tamamen sahte bir kasa açılacaktır. Ana şifrenizden farklı olmalıdır.</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Sahte PIN Girin"
              placeholderTextColor={Colors.light.textSecondary}
              secureTextEntry
              keyboardType="number-pad"
              value={newDecoyPinInput}
              onChangeText={setNewDecoyPinInput}
              autoFocus
              selectionColor={Colors.light.error}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setIsDecoyModalVisible(false); setNewDecoyPinInput(''); }}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSubmitBtn, {backgroundColor: Colors.light.error, shadowColor: Colors.light.error}]} onPress={submitNewDecoyPin}>
                <Text style={styles.modalSubmitText}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- Reset Data Modal --- */}
      <Modal visible={isResetModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconBox, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
              <MaterialIcons name="warning" size={28} color={Colors.light.error} />
            </View>
            <Text style={styles.modalTitle}>Kritik Uyarı</Text>
            <Text style={styles.modalDesc}>Tüm verilerinizi, notlarınızı ve şifrelerinizi siliyorsunuz. Bu işlem geri alınamaz. Onaylamak için kutuya büyük harflerle <Text style={{fontWeight: '800'}}>SIFIRLA</Text> yazın.</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="SIFIRLA"
              placeholderTextColor={Colors.light.textSecondary}
              value={resetConfirmInput}
              onChangeText={setResetConfirmInput}
              autoCapitalize="characters"
              autoFocus
              selectionColor={Colors.light.error}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setIsResetModalVisible(false); setResetConfirmInput(''); }}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSubmitBtn, { backgroundColor: Colors.light.error, shadowColor: Colors.light.error }]} onPress={submitReset}>
                <Text style={styles.modalSubmitText}>Tümünü Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalInput: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  }
});
