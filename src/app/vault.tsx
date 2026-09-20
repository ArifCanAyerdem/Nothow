import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useVaultStore } from '@/store/vaultStore';
import { BottomTabBar } from '@/components/BottomTabBar';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { VaultItem } from '@/store/vaultStore';
import { AnimatedCard } from '@/components/AnimatedCard';
import { FlashList } from '@shopify/flash-list';

function VaultItemCard({ item, index = 0 }: { item: VaultItem; index?: number }) {
  const router = useRouter();
  const [isRevealed, setIsRevealed] = useState(false);
  const isPassword = item.type === 'password';

  const handlePress = async () => {
    if (isPassword) {
      if (!isRevealed) {
        setIsRevealed(true);
        setTimeout(() => setIsRevealed(false), 5000); // Hide after 5 seconds
      } else {
        await Clipboard.setStringAsync(item.content);
        Alert.alert('Kopyalandı!', 'Şifre panoya kopyalandı. Güvenliğiniz için 60 saniye sonra otomatik silinecektir.');
        
        // Auto-clear clipboard after 60 seconds
        setTimeout(async () => {
          const currentContent = await Clipboard.getStringAsync();
          if (currentContent === item.content) {
            await Clipboard.setStringAsync('');
          }
        }, 60000);
      }
    } else {
      // It's a note or task, maybe navigate to detail or expand (leaving basic for now)
      Alert.alert(item.title, item.content);
    }
  };

  return (
    <View>
      <AnimatedCard 
        style={styles.vaultItem} 
        onPress={handlePress}
      >
      <Text style={styles.itemIcon}>{isPassword ? '🔑' : item.type === 'note' ? '📄' : '✅'}</Text>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {isPassword && item.username && (
          <Text style={{fontSize: 12, color: Colors.light.primary, fontWeight: '500', marginTop: 2}}>{item.username}</Text>
        )}
        <Text style={styles.itemSubtext} numberOfLines={1}>
          {isPassword 
            ? (isRevealed ? item.content : '••••••••••••••••') 
            : item.content}
        </Text>
      </View>
      {isPassword && (
        <MaterialIcons 
          name={isRevealed ? "content-copy" : "visibility"} 
          size={20} 
          color={Colors.light.primary} 
          style={{marginLeft: 8}}
        />
      )}
      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/add-note', params: { id: item.id, defaultType: item.type } })}
        style={{padding: 8, marginLeft: 4}}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      >
        <MaterialIcons name="edit" size={20} color={Colors.light.textSecondary} />
      </TouchableOpacity>
    </AnimatedCard>
    </View>
  );
}

export default function VaultScreen() {
  const router = useRouter();
  const { items, deleteItem } = useVaultStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredItems = items.filter(item => 
    item.type === 'password' &&
    ((item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
     (item.content?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header (Consistent with Home) */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogoIcon}>🗂️</Text>
          <View>
            <Text style={styles.headerSubtitle}>NOTHOW HUB</Text>
            <Text style={styles.headerTitle}>Kasa</Text>
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

      <View style={{ flex: 1, paddingHorizontal: Spacing.three }}>
        <FlashList
          data={filteredItems}
          // @ts-ignore: type definition bug in FlashList
          estimatedItemSize={80}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={() => (
            <Text style={{textAlign: 'center', color: Colors.light.textSecondary, marginTop: 40}}>
              {searchQuery ? 'Sonuç bulunamadı.' : 'Kasa şu an boş.'}
            </Text>
          )}
          ListHeaderComponent={() => (
            <>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Kayıtlarda ara..."
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

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{filteredItems.length} Güvenli Kayıt</Text>
              </View>
            </>
          )}
          renderItem={({ item, index }) => <VaultItemCard item={item} index={index} />}
        />
      </View>

      {/* Floating Action Button */}
      <View style={styles.fabWrapper}>
        <View style={styles.fabTooltip}>
          <View style={styles.fabTooltipDot} />
          <Text style={{fontSize: 10, color: '#fff'}}>Kayıt Ekle</Text>
        </View>
        <TouchableOpacity style={styles.fabMain} onPress={() => router.push({ pathname: '/add-note', params: { defaultType: 'password' } })} activeOpacity={0.8}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar via Component */}
      <BottomTabBar activeRoute="vault" />
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
    paddingBottom: 120, // Space for bottom tab bar
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
  vaultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLowest,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.2)', // Orange hint
    shadowColor: Colors.light.primary, // Glow color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  itemSubtext: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});
