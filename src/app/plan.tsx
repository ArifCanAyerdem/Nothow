import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBar } from '@/components/BottomTabBar';
import { useVaultStore, VaultItem } from '@/store/vaultStore';
import { AnimatedCard } from '@/components/AnimatedCard';
import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';

export default function PlanScreen() {
  const router = useRouter();
  const { items, updateItem, userName } = useVaultStore();
  
  const tasks = useMemo(() => {
    return items.filter(i => i.type === 'task').sort((a, b) => {
      const timeA = a.scheduledAt || a.createdAt;
      const timeB = b.scheduledAt || b.createdAt;
      return timeA - timeB;
    });
  }, [items]);
  
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const formatTaskTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return `${date.toLocaleDateString()} ${timeStr}`;
  };

  const getRecurrenceBadge = (recurrence?: string) => {
    if (!recurrence || recurrence === 'none') return null;
    return (
      <View style={[styles.recurrenceBadge, recurrence === 'daily' ? styles.badgeDaily : styles.badgeWeekly]}>
        <MaterialIcons name="loop" size={10} color="#fff" />
        <Text style={styles.recurrenceBadgeText}>{recurrence === 'daily' ? 'Günlük' : 'Haftalık'}</Text>
      </View>
    );
  };

  // Flattened data for FlashList
  const flattenedData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;

    const overdueTasks = tasks.filter(t => !t.isCompleted && (t.scheduledAt || t.createdAt) < startOfToday);
    const todayTasks = tasks.filter(t => {
      const time = t.scheduledAt || t.createdAt;
      return time >= startOfToday && time <= endOfToday;
    });
    const upcomingTasks = tasks.filter(t => (t.scheduledAt || t.createdAt) > endOfToday);

    const data: any[] = [];
    if (overdueTasks.length > 0) {
      data.push({ type: 'header', title: '🔴 Gecikenler', isOverdue: true });
      overdueTasks.forEach(t => data.push({ type: 'task', task: t, isOverdue: true }));
    }
    if (todayTasks.length > 0) {
      data.push({ type: 'header', title: '📌 Bugün', isOverdue: false });
      todayTasks.forEach(t => data.push({ type: 'task', task: t, isOverdue: false }));
    }
    if (upcomingTasks.length > 0) {
      data.push({ type: 'header', title: '📅 Yaklaşanlar', isOverdue: false });
      upcomingTasks.forEach(t => data.push({ type: 'task', task: t, isOverdue: false }));
    }
    return data;
  }, [tasks]);

  const renderItem = ({ item, index = 0 }: { item: any, index?: number }) => {
    if (item.type === 'header') {
      return <Text style={[styles.sectionTitle, item.isOverdue && { color: Colors.light.error }]}>{item.title}</Text>;
    }
    
    const task: VaultItem = item.task;
    const isOverdue = item.isOverdue;

    return (
      <View>
        <View style={styles.timelineRow}>
          <View style={styles.timelineRailContainer}>
            <View style={[styles.timelineDot, isOverdue && { backgroundColor: Colors.light.error }]} />
            <View style={styles.timelineRail} />
          </View>

        <AnimatedCard 
          style={[
            styles.taskItem, 
            task.isCompleted && styles.taskCompleted,
            isOverdue && !task.isCompleted && { borderColor: 'rgba(186, 26, 26, 0.3)' }
          ]}
          onPress={() => updateItem(task.id, { isCompleted: !task.isCompleted })}
        >
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            <View style={[styles.checkbox, task.isCompleted && styles.checkboxActive, isOverdue && !task.isCompleted && { borderColor: Colors.light.error }]}>
              {task.isCompleted && <MaterialIcons name="check" size={16} color="#fff" />}
            </View>
            <View style={{marginLeft: 12, flex: 1}}>
              <Text style={[styles.taskTitle, task.isCompleted && styles.taskTitleCompleted]} numberOfLines={1}>
                {task.title}
              </Text>
              <Text style={styles.taskDesc} numberOfLines={1}>{task.content}</Text>
              {getRecurrenceBadge(task.recurrence)}
            </View>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Text style={[styles.taskTime, isOverdue && !task.isCompleted && { color: Colors.light.error }]}>
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
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.planOverview}>
      <Text style={styles.overviewTitle}>Genel İlerleme</Text>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.overviewDesc}>{completedTasks} / {totalTasks} Görev Tamamlandı</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header */}
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
              <Text style={{color: '#fff', fontSize: 12, fontWeight: '700'}}>{userName ? userName.charAt(0).toUpperCase() : 'A'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: Spacing.three }}>
        <FlashList
          data={flattenedData}
          renderItem={renderItem}
          // @ts-ignore: type definition bug in FlashList
          estimatedItemSize={100}
          getItemType={(item) => item.type}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Harika!</Text>
              <Text style={styles.emptyStateDesc}>Şu an için planlanmış hiçbir görevin yok. Yeni bir görev ekleyerek başlayabilirsin.</Text>
            </View>
          )}
        />
      </View>

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

      {/* Bottom Tab Bar */}
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
    lineHeight: 22,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 16,
    marginLeft: 32,
    marginTop: 16,
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
    marginTop: 24,
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
    marginBottom: 4,
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
  recurrenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    gap: 4,
  },
  badgeDaily: {
    backgroundColor: Colors.light.primary,
  },
  badgeWeekly: {
    backgroundColor: '#9c27b0', // purple
  },
  recurrenceBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
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
