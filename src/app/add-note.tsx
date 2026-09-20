import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useVaultStore, VaultItemType } from '@/store/vaultStore';
import { MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod Schema for validation
const formSchema = z.object({
  type: z.enum(['note', 'password', 'task']),
  title: z.string().min(1, 'Başlık boş bırakılamaz'),
  content: z.string().min(1, 'İçerik boş bırakılamaz'),
  username: z.string().optional(),
  scheduledAt: z.date().optional(),
  recurrence: z.enum(['none', 'daily', 'weekly']).optional()
});

type FormData = z.infer<typeof formSchema>;

export default function AddNoteScreen() {
  const router = useRouter();
  const { id, defaultType } = useLocalSearchParams<{ id?: string, defaultType?: VaultItemType }>();
  const { items, addItem, updateItem, deleteItem } = useVaultStore();
  
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const aiGlowAnim = useRef(new Animated.Value(0)).current;

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: defaultType || 'note',
      title: '',
      content: '',
      username: '',
      scheduledAt: new Date(),
      recurrence: 'none'
    }
  });

  const watchType = watch('type');
  const watchContent = watch('content');
  const watchScheduledAt = watch('scheduledAt');
  const watchRecurrence = watch('recurrence');

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

  useEffect(() => {
    if (id) {
      const existingItem = items.find(item => item.id === id);
      if (existingItem) {
        reset({
          type: existingItem.type,
          title: existingItem.title,
          content: existingItem.content,
          username: existingItem.username || '',
          scheduledAt: existingItem.scheduledAt ? new Date(existingItem.scheduledAt) : new Date(),
          recurrence: existingItem.recurrence || 'none'
        });
      }
    } else if (defaultType) {
      setValue('type', defaultType);
    }
  }, [id, defaultType, items, reset, setValue]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let newPassword = '';
    for (let i = 0; i < 16; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('content', newPassword, { shouldValidate: true });
  };

  const copyToClipboard = async () => {
    if (watchContent) {
      const contentToCopy = watchContent;
      await Clipboard.setStringAsync(contentToCopy);
      Alert.alert('Kopyalandı', 'İçerik panoya kopyalandı. Güvenliğiniz için 60 saniye sonra otomatik silinecektir.');
      
      // Auto-clear clipboard after 60 seconds
      setTimeout(async () => {
        const currentContent = await Clipboard.getStringAsync();
        if (currentContent === contentToCopy) {
          await Clipboard.setStringAsync('');
        }
      }, 60000);
    } else {
      Alert.alert('Hata', 'Kopyalanacak bir içerik yok.');
    }
  };

  const transformWithAI = () => {
    if (!watchContent?.trim()) {
      Alert.alert('Bilgi', 'Dönüştürmek için önce bir not yazın.');
      return;
    }
    setIsAiProcessing(true);
    setTimeout(() => {
      const extractedTitle = watchContent.split(' ').slice(0, 3).join(' ') + '... (AI)';
      setValue('title', extractedTitle);
      setValue('type', 'task');
      setValue('content', `[AI Tarafından Düzenlendi]\n- ${watchContent}`);
      setIsAiProcessing(false);
      Alert.alert('AI Dönüşümü Başarılı', 'Notunuz düzenli bir göreve dönüştürüldü.');
    }, 1500);
  };

  const onSave = async (data: FormData) => {
    if (id) {
      await updateItem(id, {
        title: data.title.trim(),
        content: data.content.trim(),
        username: data.type === 'password' ? data.username?.trim() : undefined,
        type: data.type,
        scheduledAt: data.type === 'task' && data.scheduledAt ? data.scheduledAt.getTime() : undefined,
        recurrence: data.type === 'task' ? data.recurrence : undefined,
      });
    } else {
      await addItem({
        type: data.type,
        title: data.title.trim(),
        content: data.content.trim(),
        username: data.type === 'password' ? data.username?.trim() : undefined,
        isCompleted: false,
        scheduledAt: data.type === 'task' && data.scheduledAt ? data.scheduledAt.getTime() : undefined,
        recurrence: data.type === 'task' ? data.recurrence : undefined,
      });
    }
    router.back();
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Emin misin?', 'Bu kaydı tamamen silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        await deleteItem(id);
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
          <TouchableOpacity onPress={handleSubmit(onSave)} style={styles.saveBtn}>
            <Text style={styles.saveText}>{id ? 'Güncelle' : 'Kaydet'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {/* Type Selector (Hide if defaultType is provided or if editing) */}
          {!defaultType && !id && (
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeBtn, watchType === 'task' && styles.typeBtnActive]} 
                onPress={() => setValue('type', 'task')}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>✅</Text>
                <Text style={[styles.typeText, watchType === 'task' && styles.typeTextActive]}>Görev</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeBtn, watchType === 'note' && styles.typeBtnActive]} 
                onPress={() => setValue('type', 'note')}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>📄</Text>
                <Text style={[styles.typeText, watchType === 'note' && styles.typeTextActive]}>Not</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeBtn, watchType === 'password' && styles.typeBtnActive]} 
                onPress={() => setValue('type', 'password')}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>🔑</Text>
                <Text style={[styles.typeText, watchType === 'password' && styles.typeTextActive]}>Şifre</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={[styles.inputTitle, errors.title && {color: Colors.light.error}]}
                  placeholder={watchType === 'password' ? 'Platform (örn: Steam)' : 'Başlık girin...'}
                  placeholderTextColor={errors.title ? Colors.light.error : Colors.light.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  autoFocus
                />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

            <View style={styles.divider} />
            
            {watchType === 'password' && (
              <>
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, value } }) => (
                    <TextInput 
                      style={[styles.inputTitle, { fontSize: 16 }]}
                      placeholder="Kullanıcı Adı veya E-posta"
                      placeholderTextColor={Colors.light.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  )}
                />
                <View style={styles.divider} />
              </>
            )}

            {watchType === 'task' && (
              <View style={styles.scheduleContainer}>
                <Text style={styles.inputLabel}>Zamanlama</Text>
                <View style={{flexDirection: 'row', gap: 12}}>
                  <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
                    <MaterialIcons name="event" size={18} color={Colors.light.primary} />
                    <Text style={styles.datePickerText}>{watchScheduledAt?.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowTimePicker(true)}>
                    <MaterialIcons name="schedule" size={18} color={Colors.light.primary} />
                    <Text style={styles.datePickerText}>
                      {watchScheduledAt?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && watchScheduledAt && (
                  <DateTimePicker
                    value={watchScheduledAt}
                    mode="date"
                    display="default"
                    onValueChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setValue('scheduledAt', date);
                    }}
                  />
                )}
                {showTimePicker && watchScheduledAt && (
                  <DateTimePicker
                    value={watchScheduledAt}
                    mode="time"
                    display="default"
                    onValueChange={(event, date) => {
                      setShowTimePicker(false);
                      if (date) setValue('scheduledAt', date);
                    }}
                  />
                )}
                <View style={styles.divider} />
                
                <Text style={styles.inputLabel}>Tekrarlama</Text>
                <View style={styles.recurrenceContainer}>
                  <TouchableOpacity 
                    style={[styles.recurrenceBtn, watchRecurrence === 'none' && styles.recurrenceBtnActive]} 
                    onPress={() => setValue('recurrence', 'none')}
                  >
                    <Text style={[styles.recurrenceText, watchRecurrence === 'none' && styles.recurrenceTextActive]}>Yok</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.recurrenceBtn, watchRecurrence === 'daily' && styles.recurrenceBtnActive]} 
                    onPress={() => setValue('recurrence', 'daily')}
                  >
                    <Text style={[styles.recurrenceText, watchRecurrence === 'daily' && styles.recurrenceTextActive]}>Günlük</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.recurrenceBtn, watchRecurrence === 'weekly' && styles.recurrenceBtnActive]} 
                    onPress={() => setValue('recurrence', 'weekly')}
                  >
                    <Text style={[styles.recurrenceText, watchRecurrence === 'weekly' && styles.recurrenceTextActive]}>Haftalık</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.divider} />
              </View>
            )}

            {watchType === 'note' && (
              <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8}}>
                <TouchableOpacity onPress={() => setIsPreview(!isPreview)} style={{flexDirection: 'row', alignItems: 'center'}}>
                  <MaterialIcons name={isPreview ? "edit" : "visibility"} size={16} color={Colors.light.primary} />
                  <Text style={{color: Colors.light.primary, fontSize: 12, marginLeft: 4, fontWeight: '600'}}>
                    {isPreview ? 'Düzenle' : 'Markdown Önizleme'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Controller
              control={control}
              name="content"
              render={({ field: { onChange, value } }) => (
                <>
                  {isPreview && watchType === 'note' ? (
                    <ScrollView style={{minHeight: 200, padding: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12}}>
                      <Markdown>{value || '*Buraya Markdown ile notunuzu yazın...*'}</Markdown>
                    </ScrollView>
                  ) : (
                    <TextInput 
                      style={[styles.inputContent, errors.content && {color: Colors.light.error}]}
                      placeholder={watchType === 'password' ? 'Gizli şifreyi girin...' : watchType === 'task' ? 'Görev detayları...' : 'Notunuzu (Markdown) yazın...'}
                      placeholderTextColor={errors.content ? Colors.light.error : Colors.light.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      multiline={watchType !== 'password'}
                      secureTextEntry={watchType === 'password'}
                      textAlignVertical={watchType === 'password' ? "center" : "top"}
                    />
                  )}
                  {errors.content && <Text style={styles.errorText}>{errors.content.message}</Text>}
                </>
              )}
            />

            {watchType === 'password' && (
              <View style={{flexDirection: 'row', gap: 12, marginTop: 16}}>
                <TouchableOpacity style={[styles.actionBtn, {flex: 1, marginTop: 0}]} onPress={generatePassword} activeOpacity={0.7}>
                  <MaterialIcons name="casino" size={18} color={Colors.light.primary} />
                  <Text style={styles.actionBtnText}>Güçlü Üret</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {flex: 1, marginTop: 0}]} onPress={copyToClipboard} activeOpacity={0.7}>
                  <MaterialIcons name="content-copy" size={18} color={Colors.light.primary} />
                  <Text style={styles.actionBtnText}>Kopyala</Text>
                </TouchableOpacity>
              </View>
            )}

            {watchType === 'note' && (
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

          {/* Delete Button */}
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
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginBottom: 16,
    marginTop: 8,
  },
  inputContent: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    minHeight: 150,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
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
  },
  recurrenceContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 8,
  },
  recurrenceBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  recurrenceBtnActive: {
    backgroundColor: Colors.light.primary,
  },
  recurrenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  recurrenceTextActive: {
    color: '#fff',
  }
});
