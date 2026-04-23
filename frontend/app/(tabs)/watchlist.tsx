import { useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMutation, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { fetchMovieConfig } from '@/api/tmdb';
import { getWatchlist, removeFromWatchlist } from '@/api/watchlist';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WatchListItem } from '@/constants/types';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { FlatList } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const buildImageUrl = (baseUrl: string | null, size: string, path?: string | null) => {
  if (!baseUrl || !path) return null;
  return `${baseUrl}${size}${path}`;
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'TV Shows' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

function WatchlistContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>('all');

  const configQuery = useQuery({
    queryKey: ['tmdb-config'],
    queryFn: fetchMovieConfig,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['watchlist'],
    queryFn: ({ pageParam }) => getWatchlist(20, pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => (lastPage?.nextCursor ? parseInt(lastPage.nextCursor, 10) : undefined),
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWatchlist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      void Haptics.selectionAsync();
    },
  });

  const baseUrl = configQuery.data?.images?.secure_base_url ?? null;

  const items = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page?.items ?? []) ?? [];
    if (filter === 'all') return allItems;
    return allItems.filter((item) => item.type.toLowerCase() === filter);
  }, [data?.pages, filter]);

  const { numColumns, itemWidth, gap } = useResponsiveLayout({
    mobileColumns: 1, // List view on mobile
    tabletColumns: 2,
    desktopColumns: 3,
    gap: 12,
    containerPadding: 40, // 20 padding on each side
  });

  const renderRightActions = (item: WatchListItem) => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => removeMutation.mutate(item.tmdbId)}>
      <IconSymbol size={20} name="trash" color="#F2F2F2" />
      <ThemedText style={styles.deleteText}>Remove</ThemedText>
    </Pressable>
  );

  if (isError) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Failed to load watchlist.</ThemedText>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Your Watchlist</ThemedText>
        <ThemedText style={styles.subtitle}>Keep track of everything you want to see.</ThemedText>
      </ThemedView>

      <View style={styles.filterRow}>
        {FILTERS.map((item) => {
          const isActive = filter === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
              onPress={() => setFilter(item.key)}>
              <ThemedText style={isActive ? styles.filterTextActive : styles.filterText}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {isLoading ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : items.length === 0 ? (
          <ThemedText style={styles.emptyState}>No items yet. Start exploring.</ThemedText>
        ) : (
          <FlatList
            key={numColumns}
            data={items}
            keyExtractor={(item) => `${item.tmdbId}-${item.id ?? 'item'}`}
            numColumns={numColumns}
            contentContainerStyle={{ gap, paddingBottom: 100 }}
            columnWrapperStyle={numColumns > 1 ? { gap } : undefined}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator size="small" style={{ marginVertical: 16 }} />
              ) : null
            }
            renderItem={({ item }) => {
              const posterUrl = buildImageUrl(baseUrl, 'w342', item.posterPath);
              return (
                <View style={{ width: itemWidth }}>
                  <Swipeable
                    renderRightActions={() => renderRightActions(item)}>
                    <Pressable
                      style={styles.row}
                      onPress={() => router.push(`/movie/${item.tmdbId}?type=${item.type}`)}>
                      {posterUrl ? (
                        <Image
                          source={{ uri: posterUrl }}
                          style={styles.poster}
                          contentFit="cover"
                          transition={300}
                        />
                      ) : (
                        <View style={styles.posterPlaceholder} />
                      )}
                      <View style={styles.rowInfo}>
                        <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                        <ThemedText style={styles.rowMeta}>
                          {item.releaseYear ? item.releaseYear : 'Year n/a'} ·{' '}
                          {item.type.toUpperCase()}
                        </ThemedText>
                      </View>
                    </Pressable>
                  </Swipeable>
                </View>
              );
            }}
          />
        )}
      </View>
    </ThemedView >
  );
}

export default function WatchlistScreen() {
  return (
    <ErrorBoundary>
      <WatchlistContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    gap: 6,
    marginBottom: 16,
  },
  subtitle: {
    color: '#9C9C9C',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#1F1F1F',
  },
  filterChipActive: {
    backgroundColor: '#F5C518',
  },
  filterText: {
    color: '#CFCFCF',
  },
  filterTextActive: {
    color: '#121212',
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    marginBottom: 12,
  },
  poster: {
    width: 70,
    height: 105,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  posterPlaceholder: {
    width: 70,
    height: 105,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  rowInfo: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  rowMeta: {
    color: '#9C9C9C',
    fontSize: 12,
  },
  deleteAction: {
    width: 96,
    marginBottom: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D64545',
    gap: 4,
  },
  deleteText: {
    color: '#F7F7F7',
    fontSize: 12,
  },
  emptyState: {
    color: '#9C9C9C',
    textAlign: 'center',
    marginTop: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  retryButton: {
    backgroundColor: '#F5C518',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#121212',
    fontWeight: 'bold',
  },
});
