import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSagaStore } from '@/services/saga/sagaStore';
import { useCurrentUser } from '@/services/auth/authStore';
import SignalsBar from '@/components/ui/SignalsBar';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import type { Saga } from '@/services/saga/sagaTypes';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlayStackParamList } from '@/navigation/PlayStackNavigator';

type Nav = NativeStackNavigationProp<PlayStackParamList, 'SagaList'>;

function SagaCard({ saga, onPress }: { saga: Saga; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardBadge}>
        <Text style={styles.cardBadgeText}>SAGA</Text>
      </View>
      <Text style={styles.cardTitle}>{saga.title}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {saga.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>{saga.totalSteps} steps</Text>
        <Text style={styles.cardCta}>Start →</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { sagas, isLoading, loadAllSagas } = useSagaStore();
  const currentUser = useCurrentUser();

  useEffect(() => {
    loadAllSagas();
  }, [loadAllSagas]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{currentUser?.name ?? 'Cloud Engineer'}</Text>
        </View>
        <SignalsBar />
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={sagas}
          keyExtractor={s => s.id}
          renderItem={({ item }) => (
            <SagaCard
              saga={item}
              onPress={() => navigation.navigate('SagaDetail', { sagaId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionHeader}>Available Sagas</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  greeting: {
    ...Typography.footnote,
    color: Colors.textSecondary,
  },
  userName: {
    ...Typography.title3,
    color: Colors.textPrimary,
  },
  loader: {
    marginTop: Spacing.xxxl,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeader: {
    ...Typography.title2,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  cardBadge: {
    backgroundColor: Colors.primary + '26',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardBadgeText: {
    ...Typography.caption2,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTitle: {
    ...Typography.headline,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    ...Typography.subheadline,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    ...Typography.footnote,
    color: Colors.textTertiary,
  },
  cardCta: {
    ...Typography.callout,
    color: Colors.primary,
    fontWeight: '600',
  },
});
