import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBar } from '@/components/BottomTabBar';
import { AnimatedCard } from '@/components/AnimatedCard';

export default function NotesScreen() {
  const router = useRouter();
  const { items, deleteItem } = useVaultStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const noteItems = items.filter(i => i.type === 'note' || i.type === 'task')
    .filter(item => 
      (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      (item.content?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.createdAt - a.createdAt);


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header (Consistent with Home) */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogoIcon}>📝</Text>
          <View>
            <Text style={styles.headerSubtitle}>NOTHOW HUB</Text>
            <Text style={styles.headerTitle}>Tüm Notlar</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
            <View style={styles.profileAvatar}>
              <Text style={{color: '#fff', fontSize: 12, fontWeight: '700'}}>A</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Notlarda ara..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Notes Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{noteItems.length} Kayıtlı Not</Text>
          </View>
          
          <View style={{gap: 12}}>
            {noteItems.map((item) => (
              <AnimatedCard 
                key={item.id} 
                style={styles.noteCard} 
              >
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 20, marginRight: 8}}>
                      {item.type === 'note' ? '📄' : '✅'}
                    </Text>
                    <Text style={{fontSize: 16, fontWeight: '600', color: Colors.light.text}}>{item.title}</Text>
                  </View>
                  <Text style={{fontSize: 10, color: Colors.light.textSecondary}}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={{fontSize: 13, color: Colors.light.textSecondary, marginTop: 8}}>
                  {item.content}
                </Text>
                <View style={styles.noteFooter}>
                  <View style={{flexDirection: 'row', gap: 6}}>
                    <View style={styles.noteTag}><Text style={styles.noteTagText}>#{item.type}</Text></View>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                    <TouchableOpacity 
                      style={{flexDirection: 'row', alignItems: 'center'}}
                      onPress={() => router.push({ pathname: '/add-note', params: { id: item.id } })}
                    >
                      <MaterialIcons name="edit" size={14} color={Colors.light.primary} />
                      <Text style={{fontSize: 11, color: Colors.light.primary, fontWeight: '600', marginLeft: 2}}>Düzenle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </AnimatedCard>
            ))}

            {noteItems.length === 0 && (
              <Text style={{color: Colors.light.textSecondary, textAlign: 'center', marginTop: 20}}>Henüz not bulunmuyor.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabWrapper}>
        <View style={styles.fabTooltip}>
          <View style={styles.fabTooltipDot} />
          <Text style={{fontSize: 10, color: '#fff'}}>Not Ekle</Text>
        </View>
        <TouchableOpacity style={styles.fabMain} onPress={() => router.push({ pathname: '/add-note', params: { defaultType: 'note' } })} activeOpacity={0.8}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <BottomTabBar activeRoute="notes" />
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
  },
  profileAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: 16,
    paddingBottom: 120, 
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLowest,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.light.text,
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
