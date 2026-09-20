import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBar } from '@/components/BottomTabBar';
import { useVaultStore } from '@/store/vaultStore';
import { AnimatedCard } from '@/components/AnimatedCard';

export default function PlanScreen() {
  const router = useRouter();
  const { items, updateItem } = useVaultStore();
  const tasks = items.filter(i => i.type === 'task').sort((a, b) => {
    const timeA = a.scheduledAt || a.createdAt;
    const timeB = b.scheduledAt || b.createdAt;
    return timeA - timeB; // Sort ascending (chronological)
  });
  
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const formatTaskTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (isToday) return `Bugün ${timeStr}`;
    return `${date.toLocaleDateString()} ${timeStr}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header (Consistent with Home) */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogoIcon}>📅</Text>
          <View>
            <Text style={styles.headerSubtitle}>NOTHOW HUB</Text>
            <Text style={styles.headerTitle}>Plan</Text>
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
        {/* Plan Header */}
        <View style={styles.planOverview}>
          <Text style={styles.overviewTitle}>Günlük İlerleme</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.overviewDesc}>{completedTasks} / {totalTasks} Görev Tamamlandı</Text>
        </View>

        <View style={styles.timelineContainer}>
          {tasks.map((task, index) => (
            <View key={task.id} style={styles.timelineRow}>
              {/* Timeline Rail & Dot */}
              <View style={styles.timelineRailContainer}>
                <View style={styles.timelineDot} />
                {index !== tasks.length - 1 && <View style={styles.timelineRail} />}
              </View>

              <AnimatedCard 
                style={[styles.taskItem, task.isCompleted && styles.taskCompleted]}
                onPress={() => updateItem(task.id, { isCompleted: !task.isCompleted })}
              >
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View style={[styles.checkbox, task.isCompleted && styles.checkboxActive]}>
                {task.isCompleted && <MaterialIcons name="check" size={16} color="#fff" />}
              </View>
              <View style={{marginLeft: 12, flex: 1}}>
                <Text style={[styles.taskTitle, task.isCompleted && styles.taskTitleCompleted]} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={styles.taskDesc} numberOfLines={1}>{task.content}</Text>
              </View>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.taskTime}>
                {formatTaskTime(task.scheduledAt || task.createdAt)}
              </Text>
              <TouchableOpacity 
                onPress={() => router.push({ pathname: '/add-note', params: { id: task.id, defaultType: task.type } })}
                style={{marginTop: 8, padding: 4}}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <MaterialIcons name="edit" size={18} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        </View>
      ))}
    </View>

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Harika!</Text>
            <Text style={styles.emptyStateDesc}>Bugün için hiçbir görevin kalmadı veya hiç görev eklemedin.</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabWrapper}>
        <View style={styles.fabTooltip}>
          <View style={styles.fabTooltipDot} />
          <Text style={{fontSize: 10, color: '#fff'}}>Görev Ekle</Text>
        </View>
        <TouchableOpacity style={styles.fabMain} onPress={() => router.push({ pathname: '/add-note', params: { defaultType: 'task' } })} activeOpacity={0.8}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar via Component */}
      <BottomTabBar activeRoute="plan" />
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
  emptyState: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  planOverview: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 5,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.primaryContainer,
    borderRadius: 5,
  },
  overviewDesc: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'right',
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineRailContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
    marginTop: 24, // Align with the card center
  },
  timelineRail: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.light.surfaceContainer,
    marginTop: 4,
  },
  taskItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLowest,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  taskCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.light.primaryContainer,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.light.textSecondary,
  },
  taskDesc: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  taskTime: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginLeft: 8,
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
