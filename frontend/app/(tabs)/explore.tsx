import { useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { fetchMovieConfig, getTrendingMovies, searchMovies } from '@/api/tmdb';
import { MediaCard } from '@/components/MediaCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { TmdbSearchResult } from '@/constants/types';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TabTwoScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { numColumns, itemWidth, gap } = useResponsiveLayout({
    mobileColumns: 3,
    tabletColumns: 4,
    desktopColumns: 6,
    gap: 16,
    containerPadding: 32, // ParallaxScrollView default padding logic + list content padding
  });

  const configQuery = useQuery({
    queryKey: ['tmdb-config'],
    queryFn: fetchMovieConfig,
  });

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => clearTimeout(handle);
  }, [query]);

  const trendingQuery = useQuery({
    queryKey: ['trending'],
    queryFn: getTrendingMovies,
  });

  const searchQuery = useInfiniteQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: ({ pageParam }) => searchMovies(debouncedQuery, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.page >= lastPage.total_pages) return undefined;
      return lastPage.page + 1;
    },
    enabled: Boolean(debouncedQuery),
  });

  const buildPosterUrl = useMemo(() => {
    const configBaseUrl = configQuery.data?.images?.secure_base_url ?? null;
    if (!configBaseUrl) {
      return (_: string | null | undefined) => null;
    }
    return (path: string | null | undefined) => (path ? `${configBaseUrl}w500${path}` : null);
  }, [configQuery.data?.images?.secure_base_url]);

  const searchResults = (searchQuery.data?.pages.flatMap((page) => page?.results ?? []) ?? []).filter(
    (result) => result.media_type !== 'person',
  );

  const trendingResults = (trendingQuery.data?.results ?? []).filter(
    (result) => result.media_type !== 'person',
  );

  const results = debouncedQuery ? searchResults : trendingResults;

  const suggestedTags = ['Oppenheimer', 'Animated', 'Marvel', 'Drama', 'Comedy', 'Thriller'];

  const handlePressItem = (item: TmdbSearchResult) => {
    router.push(`/movie/${item.id}?type=${item.media_type || 'movie'}`);
  };

  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <FlatList
        key={numColumns} // Force re-render on column change
        data={results}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { gap, paddingHorizontal: 32 }]}
        numColumns={numColumns}
        columnWrapperStyle={[styles.gridRow, { gap }]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText
                type="title"
                style={{
                  fontFamily: Fonts.rounded,
                }}>
                Explore
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.subtitle}>
              Search for movies from your watchlist backend.
            </ThemedText>
            <ThemedView style={styles.searchContainer}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search movies..."
                placeholderTextColor="#9E9E9E"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
              />
              {searchQuery.isFetching ? <ActivityIndicator size="small" /> : null}
            </ThemedView>
            {searchQuery.isError ? (
              <ThemedText style={styles.errorText}>Search failed. Please try again.</ThemedText>
            ) : null}

            {!debouncedQuery && (
              <View style={styles.tagsContainer}>
                <ThemedText style={styles.sectionTitle}>Suggested</ThemedText>
                <View style={styles.tagsRow}>
                  {suggestedTags.map((tag) => (
                    <Pressable key={tag} style={styles.tag} onPress={() => setQuery(tag)}>
                      <ThemedText style={styles.tagText}>{tag}</ThemedText>
                    </Pressable>
                  ))}
                </View>
                <ThemedText style={[styles.sectionTitle, { marginTop: 24 }]}>Trending Now</ThemedText>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => {
          return (
            <MediaCard
              item={item}
              onPress={handlePressItem}
              width={itemWidth}
              baseUrl={configQuery.data?.images?.secure_base_url}
              style={styles.gridItem}
            />
          );
        }}
        ListEmptyComponent={
          query.trim() ? (
            <ThemedText style={styles.emptyText}>
              {searchQuery.isFetching ? 'Searching...' : 'No results found.'}
            </ThemedText>
          ) : trendingQuery.isLoading ? (
            <ActivityIndicator size="small" style={{ marginTop: 20 }} />
          ) : null
        }
        onEndReached={() => {
          if (searchQuery.hasNextPage) {
            searchQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          searchQuery.isFetchingNextPage ? (
            <ActivityIndicator size="small" style={{ marginVertical: 16 }} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    paddingHorizontal: 32,
    paddingTop: 32,
    gap: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EDEDED',
    marginBottom: 12,
  },
  subtitle: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F1F1F1',
    color: '#1A1A1A',
  },
  errorText: {
    color: '#B00020',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
    gap: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
    maxWidth: '32%',
    gap: 8,
  },
  emptyText: {
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 12,
  },
  tagsContainer: {
    marginTop: 12,
    gap: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  tag: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#2B2B2B',
  },
  tagText: {
    color: '#EDEDED',
    fontSize: 12,
  },
});
