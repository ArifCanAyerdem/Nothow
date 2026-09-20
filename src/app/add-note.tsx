import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useVaultStore, VaultItemType } from '@/store/vaultStore';
import { MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddNoteScreen() {
  const router = useRouter();
  const { id, defaultType } = useLocalSearchParams<{ id?: string, defaultType?: VaultItemType }>();
  const { items, addItem, updateItem, deleteItem } = useVaultStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [type, setType] = useState<VaultItemType>(defaultType || 'note');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const aiGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAiProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(aiGlowAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
          Animated.timing(aiGlowAnim, { toValue: 0, duration: 800, useNativeDriver: false })
        ])
      ).start();
    } else {
      aiGlowAnim.setValue(0);
      aiGlowAnim.stopAnimation();
    }
  }, [isAiProcessing]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let newPassword = '';
    for (let i = 0; i < 16; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setContent(newPassword);
  };

  const transformWithAI = () => {
    if (!content.trim()) {
      Alert.alert('Bilgi', 'Dönüştürmek için önce bir not yazın.');
      return;
    }
    setIsAiProcessing(true);
    setTimeout(() => {
      const extractedTitle = content.split(' ').slice(0, 3).join(' ') + '... (AI)';
      setTitle(extractedTitle);
      setType('task');
      setContent(`[AI Tarafından Düzenlendi]\n- ${content}`);
      setIsAiProcessing(false);
      Alert.alert('AI Dönüşümü Başarılı', 'Notunuz düzenli bir göreve dönüştürüldü.');
    }, 1500);
  };

  useEffect(() => {
    if (id) {
      const existingItem = items.find(item => item.id === id);
      if (existingItem) {
        setTitle(existingItem.title);
        setContent(existingItem.content);
        setType(existingItem.type);
        if (existingItem.username) setUsername(existingItem.username);
        if (existingItem.scheduledAt) {
          setScheduledAt(new Date(existingItem.scheduledAt));
        }
      }
    } else if (defaultType) {
      setType(defaultType);
    }
  }, [id, defaultType]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen başlık ve içerik girin.');
      return;
    }
    
    if (id) {
      updateItem(id, {
        title: title.trim(),
        content: content.trim(),
        username: type === 'password' ? username.trim() : undefined,
        type,
        scheduledAt: type === 'task' ? scheduledAt.getTime() : undefined,
      });
    } else {
      addItem({
        type,
        title: title.trim(),
        content: content.trim(),
        username: type === 'password' ? username.trim() : undefined,
        isCompleted: false,
        scheduledAt: type === 'task' ? scheduledAt.getTime() : undefined,
      });
    }

    router.back();
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Emin misin?', 'Bu kaydı tamamen silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => {
        deleteItem(id);
        router.back();
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <MaterialIcons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{id ? 'Düzenle' : 'Yeni Kayıt'}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>{id ? 'Güncelle' : 'Kaydet'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {/* Type Selector (Hide if defaultType is provided) */}
          {!defaultType && !id && (
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'task' && styles.typeBtnActive]} 
                onPress={() => setType('task')}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>✅</Text>
                <Text style={[styles.typeText, type === 'task' && styles.typeTextActive]}>Görev</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'note' && styles.typeBtnActive]} 
                onPress={() => setType('note')}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>📄</Text>
                <Text style={[styles.typeText, type === 'note' && styles.typeTextActive]}>Not</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'password' && styles.typeBtnActive]} 
                onPress={() => setType('password')}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>🔑</Text>
                <Text style={[styles.typeText, type === 'password' && styles.typeTextActive]}>Şifre</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.inputTitle}
              placeholder={type === 'password' ? 'Platform (örn: Steam)' : 'Başlık girin...'}
              placeholderTextColor={Colors.light.textSecondary}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            <View style={styles.divider} />
            
            {type === 'password' && (
              <>
                <TextInput 
                  style={[styles.inputTitle, { fontSize: 16 }]}
                  placeholder="Kullanıcı Adı veya E-posta"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <View style={styles.divider} />
              </>
            )}

            {type === 'task' && (
              <View style={styles.scheduleContainer}>
                <Text style={styles.inputLabel}>Zamanlama</Text>
                <View style={{flexDirection: 'row', gap: 12}}>
                  <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
                    <MaterialIcons name="event" size={18} color={Colors.light.primary} />
                    <Text style={styles.datePickerText}>{scheduledAt.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowTimePicker(true)}>
                    <MaterialIcons name="schedule" size={18} color={Colors.light.primary} />
                    <Text style={styles.datePickerText}>
                      {scheduledAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={scheduledAt}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setScheduledAt(date);
                    }}
                  />
                )}
                {showTimePicker && (
                  <DateTimePicker
                    value={scheduledAt}
                    mode="time"
                    display="default"
                    onChange={(event, date) => {
                      setShowTimePicker(false);
                      if (date) setScheduledAt(date);
                    }}
                  />
                )}
                <View style={styles.divider} />
              </View>
            )}

            {type === 'note' && (
              <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8}}>
                <TouchableOpacity onPress={() => setIsPreview(!isPreview)} style={{flexDirection: 'row', alignItems: 'center'}}>
                  <MaterialIcons name={isPreview ? "edit" : "visibility"} size={16} color={Colors.light.primary} />
                  <Text style={{color: Colors.light.primary, fontSize: 12, marginLeft: 4, fontWeight: '600'}}>
                    {isPreview ? 'Düzenle' : 'Markdown Önizleme'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {isPreview && type === 'note' ? (
              <ScrollView style={{minHeight: 200, padding: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12}}>
                <Markdown>{content || '*Buraya Markdown ile notunuzu yazın...*'}</Markdown>
              </ScrollView>
            ) : (
              <TextInput 
                style={styles.inputContent}
                placeholder={type === 'password' ? 'Gizli şifreyi girin...' : type === 'task' ? 'Görev detayları...' : 'Notunuzu (Markdown) yazın...'}
                placeholderTextColor={Colors.light.textSecondary}
                value={content}
                onChangeText={setContent}
                multiline={type !== 'password'}
                secureTextEntry={type === 'password'}
                textAlignVertical={type === 'password' ? "center" : "top"}
              />
            )}

            {type === 'password' && (
              <TouchableOpacity style={styles.actionBtn} onPress={generatePassword} activeOpacity={0.7}>
                <MaterialIcons name="casino" size={18} color={Colors.light.primary} />
                <Text style={styles.actionBtnText}>Güvenli Şifre Üret</Text>
              </TouchableOpacity>
            )}

            {type === 'note' && (
              <Animated.View style={[
                styles.actionBtn, 
                { 
                  backgroundColor: aiGlowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [Colors.light.surfaceContainerLowest, 'rgba(255, 107, 0, 0.1)']
                  }),
                  borderColor: aiGlowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [Colors.light.border, Colors.light.primary]
                  })
                }
              ]}>
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center'}} onPress={transformWithAI} disabled={isAiProcessing}>
                  <MaterialIcons name="auto-awesome" size={18} color={Colors.light.primary} />
                  <Text style={styles.actionBtnText}>{isAiProcessing ? 'Yapay Zeka Analiz Ediyor...' : 'AI ile Göreve Çevir'}</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          {/* Delete Button (Only visible when editing) */}
          {id && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
              <MaterialIcons name="delete-outline" size={20} color={Colors.light.error} />
              <Text style={styles.deleteText}>Bu Kaydı Sil</Text>
            </TouchableOpacity>
          )}
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
  header: {
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
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.light.primaryContainer,
    borderRadius: 20,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  form: {
    padding: Spacing.four,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  typeBtnActive: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  typeIcon: {
    fontSize: 14,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  typeTextActive: {
    color: Colors.light.text,
  },
  inputContainer: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 250,
  },
  inputTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginBottom: 16,
  },
  inputContent: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    minHeight: 150,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(186, 26, 26, 0.1)',
    borderRadius: 16,
    gap: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.error,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
    backgroundColor: Colors.light.surfaceContainerLowest,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  scheduleContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  datePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  datePickerText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  }
});
