import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useVaultStore } from '@/store/vaultStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const { items } = useVaultStore();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Görevleri bul (Tamamlanmamış ve zamanı bugün veya geçmiş olanlar)
  const notifications = items.filter(i => {
    if (i.type !== 'task' || i.isCompleted) return false;
    const time = i.scheduledAt || i.createdAt;
    return time <= todayEnd.getTime();
  }).sort((a, b) => (a.scheduledAt || a.createdAt) - (b.scheduledAt || b.createdAt));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        <View style={{width: 44}} /> {/* Placeholder for alignment */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length > 0 ? (
          <View style={{width: '100%'}}>
            <Text style={styles.sectionTitle}>Bugünün Görevleri ({notifications.length})</Text>
            {notifications.map(note => (
              <TouchableOpacity 
                key={note.id} 
                style={styles.notificationCard} 
                onPress={() => router.push('/plan')}
                activeOpacity={0.8}
              >
                <View style={styles.iconBg}>
                  <MaterialIcons name="calendar-today" size={20} color={Colors.light.primary} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{note.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{note.content}</Text>
                  <Text style={styles.cardTime}>
                    {note.scheduledAt ? new Date(note.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Zamanlanmamış'}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-off" size={48} color={Colors.light.surfaceContainerHigh} />
            <Text style={styles.emptyStateTitle}>Harika gidiyorsun!</Text>
            <Text style={styles.emptyStateDesc}>Bugün için bekleyen bir görev bildirimi yok.</Text>
          </View>
        )}
      </ScrollView>
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
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLowest,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 43, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: '40%',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  }
});
