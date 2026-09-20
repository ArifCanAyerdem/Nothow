import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Alert, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useVaultStore } from '@/store/vaultStore';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBar } from '@/components/BottomTabBar';
import { AnimatedCard } from '@/components/AnimatedCard';
import { BlurView } from 'expo-blur';
import { useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { items, isUnlocked } = useVaultStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const tasks = items.filter(item => item.type === 'task');
  const completedTasks = tasks.filter(item => item.isCompleted);
  const totalTasks = tasks.length || 1;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedTasks.length / totalTasks) * 100);
  
  const handleSoon = () => Alert.alert('Çok Yakında', 'Bu özellik bir sonraki güncellemede aktif olacak.');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogoIcon}>⚙️</Text>
          <View>
            <Text style={styles.headerSubtitle}>NOTHOW HUB</Text>
            <Text style={styles.headerTitle}>Ana Sayfa</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.light.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
            <View style={styles.profileAvatar}>
              <Text style={{color: '#fff', fontSize: 12, fontWeight: '700'}}>A</Text>
            </View>
            <Text style={styles.profileText}>Profil</Text>
            <MaterialIcons name="chevron-right" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.greetingTitle}>Günaydın</Text>
              <Text style={{fontSize: 24, marginLeft: 4}}>👋</Text>
            </View>
            <Text style={styles.greetingDesc}>
              Bugün için <Text style={{color: Colors.light.primaryContainer, fontWeight: '700'}}>{tasks.length} görevin</Text> var.
            </Text>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <TouchableOpacity style={styles.vaultPill} onPress={() => router.push('/vault')}>
              <View style={styles.vaultPillDot} />
              <Text style={styles.vaultPillText}>KASA GÜVENDE</Text>
              <MaterialIcons name="chevron-right" size={14} color={Colors.light.textSecondary} />
            </TouchableOpacity>
            <Text style={{fontSize: 10, color: Colors.light.textSecondary, marginTop: 4}}>Dokun: Şifreleri Aç</Text>
          </View>
        </View>

        {/* Global Spotlight Arama */}
        <BlurView intensity={60} tint="light" style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={Colors.light.textSecondary} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Kasa, Notlar ve Görevlerde Ara..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          )}
        </BlurView>

        {/* Bugün Kartı (Progress) */}
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>BUGÜN</Text>
              </View>
              <Text style={{fontSize: 11, color: Colors.light.textSecondary, marginLeft: 6}}>• Canlı Senkronize</Text>
            </View>
            <Text style={{fontSize: 12, fontWeight: '600', color: Colors.light.primary}}>%{completionRate} Tamamlandı</Text>
          </View>
          
          <View style={{marginBottom: 16}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <Text style={{fontSize: 20, fontWeight: '700', color: Colors.light.text}}>{completedTasks.length} / {tasks.length} görev</Text>
              <Text style={{fontSize: 10, color: Colors.light.textSecondary}}>Hedef: %100</Text>
            </View>
            <Text style={{fontSize: 13, color: Colors.light.textSecondary, marginTop: 4}}>
              {completionRate === 100 ? '🎉 Harika! Tüm görevleri bitirdin.' : `✨ Harika gidiyorsun, ${tasks.length - completedTasks.length} görev kaldı.`}
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${completionRate}%` }]} />
          </View>

          <View style={styles.todayFooter}>
            <Text style={{fontSize: 11, color: Colors.light.textSecondary}}>Kart dokun: Tam Analiz</Text>
            <TouchableOpacity style={styles.todayActionBtn} onPress={() => router.push('/plan')}>
              <Text style={styles.todayActionText}>Günlük Rapor</Text>
              <MaterialIcons name="arrow-forward" size={14} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hızlı Erişim Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
            <Text style={{fontSize: 10, color: Colors.light.textSecondary}}>Modüller</Text>
          </View>
          <View style={styles.gridContainer}>
            {/* Notlar */}
            <AnimatedCard style={styles.gridCard} onPress={() => router.push('/notes')}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={[styles.gridIconBg, { backgroundColor: 'rgba(255, 219, 204, 0.4)' }]}>
                  <MaterialIcons name="description" size={22} color={Colors.light.primary} />
                </View>
                <MaterialIcons name="arrow-outward" size={16} color={Colors.light.textSecondary} />
              </View>
              <Text style={styles.gridTitle}>Notlar</Text>
              <Text style={styles.gridSubtitle}>Zengin metin & AI özet</Text>
              <View style={styles.gridFooter}>
                <Text style={styles.gridActionText}>Açmak için dokun</Text>
                <Text style={styles.gridMetaText}>14 Not</Text>
              </View>
            </AnimatedCard>

            {/* Kasa */}
            <AnimatedCard style={styles.gridCard} onPress={() => router.push('/vault')}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={[styles.gridIconBg, { backgroundColor: Colors.light.surfaceContainerHigh }]}>
                  <MaterialIcons name="lock" size={22} color={Colors.light.text} />
                </View>
                <MaterialIcons name="arrow-outward" size={16} color={Colors.light.textSecondary} />
              </View>
              <Text style={styles.gridTitle}>Kasa</Text>
              <Text style={styles.gridSubtitle}>AES-256 Şifre Yöneticisi</Text>
              <View style={styles.gridFooter}>
                <Text style={[styles.gridActionText, { color: Colors.light.success }]}>Korumalı • Giriş</Text>
                <Text style={styles.gridMetaText}>8 Öğe</Text>
              </View>
            </AnimatedCard>
            
            {/* Takvim */}
            <AnimatedCard style={styles.gridCard} onPress={() => router.push('/plan')}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={[styles.gridIconBg, { backgroundColor: Colors.light.secondaryContainer }]}>
                  <MaterialIcons name="calendar-today" size={22} color={Colors.light.text} />
                </View>
                <MaterialIcons name="arrow-outward" size={16} color={Colors.light.textSecondary} />
              </View>
              <Text style={styles.gridTitle}>Takvim</Text>
              <Text style={styles.gridSubtitle}>Zaman Blokları</Text>
              <View style={styles.gridFooter}>
                <Text style={styles.gridActionText}>Görünüme git</Text>
                <Text style={styles.gridMetaText}>3 Etkinlik</Text>
              </View>
            </AnimatedCard>

            {/* Fikirler */}
            <AnimatedCard style={styles.gridCard} onPress={() => router.push('/notes')}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={[styles.gridIconBg, { backgroundColor: 'rgba(255, 182, 147, 0.4)' }]}>
                  <MaterialIcons name="lightbulb" size={22} color={Colors.light.onPrimaryContainer} />
                </View>
                <MaterialIcons name="arrow-outward" size={16} color={Colors.light.textSecondary} />
              </View>
              <Text style={styles.gridTitle}>Fikirler</Text>
              <Text style={styles.gridSubtitle}>Proje Yol Haritası</Text>
              <View style={styles.gridFooter}>
                <Text style={styles.gridActionText}>Fikir panosu</Text>
                <Text style={styles.gridMetaText}>5 Taslak</Text>
              </View>
            </AnimatedCard>
          </View>
        </View>

        {/* Son Notlar (Vault'tan çekilen gerçek veriler) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Notlar & Şifreler</Text>
            <TouchableOpacity onPress={() => router.push('/vault')}>
              <Text style={{fontSize: 12, color: Colors.light.primary, fontWeight: '600'}}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{gap: 12}}>
            {items.slice(0, 3).map((item) => (
              <AnimatedCard key={item.id} style={styles.noteCard} onPress={() => router.push(item.type === 'password' ? '/vault' : '/notes')}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 20, marginRight: 8}}>
                      {item.type === 'password' ? '🔑' : item.type === 'note' ? '📄' : '✅'}
                    </Text>
                    <Text style={{fontSize: 16, fontWeight: '600', color: Colors.light.text}}>{item.title}</Text>
                  </View>
                  <Text style={{fontSize: 10, color: Colors.light.textSecondary}}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={{fontSize: 13, color: Colors.light.textSecondary, marginTop: 8}} numberOfLines={1}>
                  {item.type === 'password' ? '••••••••••••' : item.content}
                </Text>
                <View style={styles.noteFooter}>
                  <View style={{flexDirection: 'row', gap: 6}}>
                    <View style={styles.noteTag}><Text style={styles.noteTagText}>#{item.type}</Text></View>
                    <View style={styles.noteTag}><Text style={styles.noteTagText}>#secure</Text></View>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                    <TouchableOpacity 
                      style={{flexDirection: 'row', alignItems: 'center'}}
                      onPress={() => router.push({ pathname: '/add-note', params: { id: item.id } })}
                    >
                      <MaterialIcons name="edit" size={14} color={Colors.light.primary} />
                      <Text style={{fontSize: 11, color: Colors.light.primary, fontWeight: '600', marginLeft: 2}}>Düzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={{flexDirection: 'row', alignItems: 'center'}}
                      onPress={() => router.push(item.type === 'password' ? '/vault' : '/notes')}
                    >
                      <MaterialIcons name="arrow-forward" size={14} color={Colors.light.textSecondary} />
                      <Text style={{fontSize: 11, color: Colors.light.textSecondary, marginLeft: 2}}>Aç</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </AnimatedCard>
            ))}
            
            {items.length === 0 && (
              <Text style={{color: Colors.light.textSecondary, textAlign: 'center', marginTop: 20}}>Henüz hiçbir şey eklenmemiş.</Text>
            )}
          </View>
        </View>

        {/* Son Kullanılanlar Hapları */}
        <View style={[styles.section, { paddingBottom: 60 }]}>
          <Text style={{fontSize: 10, fontWeight: '600', color: Colors.light.textSecondary, letterSpacing: 1, marginBottom: 8}}>SON KULLANILANLAR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 8}}>
            <TouchableOpacity style={styles.pillCard} onPress={() => router.push('/vault')}><Text style={styles.pillIcon}>🔐</Text><Text style={styles.pillText}>Steam hesabı</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pillCard} onPress={() => router.push('/notes')}><Text style={styles.pillIcon}>💡</Text><Text style={styles.pillText}>Unity Projesi</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pillCard} onPress={() => router.push('/plan')}><Text style={styles.pillIcon}>📅</Text><Text style={styles.pillText}>KPSS Planı</Text></TouchableOpacity>
          </ScrollView>
        </View>

      </ScrollView>

      {/* Floating Action Button (New Design - Bottom Right) */}
      <View style={styles.fabWrapper}>
        <View style={styles.fabTooltip}>
          <View style={styles.fabTooltipDot} />
          <Text style={{fontSize: 10, color: '#fff'}}>Dokun: Hızlı Ekle</Text>
        </View>
        <TouchableOpacity style={styles.fabMain} onPress={() => router.push('/add-note')} activeOpacity={0.8}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* New 5-Tab Bottom Bar via Component */}
      <BottomTabBar activeRoute="home" />
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primaryContainer,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 4,
  },
  profileAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: 16,
    paddingBottom: 120, // Tab bar and FAB space
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
  },
  greetingDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  vaultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  vaultPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.success,
  },
  vaultPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.text,
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: Colors.light.text,
  },
  todayCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayBadge: {
    backgroundColor: Colors.light.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.onPrimaryFixed,
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 6,
    marginBottom: 12,
    padding: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.primaryContainer,
    borderRadius: 4,
  },
  todayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 8,
  },
  todayActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  todayActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCard: {
    width: '48%',
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  gridIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  gridSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.surfaceContainer,
    marginTop: 8,
    paddingTop: 6,
  },
  gridActionText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  gridMetaText: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  noteCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.surfaceContainer,
    marginTop: 12,
    paddingTop: 8,
  },
  noteTag: {
    backgroundColor: Colors.light.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  noteTagText: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLowest,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'flex-end',
    gap: 6,
    zIndex: 20,
  },
  fabTooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 49, 47, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  fabTooltipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primaryContainer,
  },
  fabMain: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 8,
  },
});
