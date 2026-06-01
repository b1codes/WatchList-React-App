import { useMemo } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { MediaCard } from '@/components/MediaCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { MediaDto } from '@/constants/types';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useGetMovieConfigQuery, useGetTrendingMoviesQuery, useDiscoverMoviesQuery } from '@/store/api/tmdbApi';

const buildImageUrl = (baseUrl: string | null, size: string, path?: string | null) => {
  if (!baseUrl || !path) return null;
  return `${baseUrl}${size}${path}`;
};

function HomeContent() {
  const router = useRouter();
  const { data: config } = useGetMovieConfigQuery();
  const { data: trending } = useGetTrendingMoviesQuery();
  const { data: discover } = useDiscoverMoviesQuery(1);

  const { isMobile } = useResponsiveLayout();

  const baseUrl = config?.images?.secure_base_url ?? null;
  const heroItem = trending?.items?.[0] ?? null;

  const heroPoster = useMemo(
    () => buildImageUrl(baseUrl, 'w780', heroItem?.posterPath),
    [baseUrl, heroItem?.posterPath],
  );

  const handlePressMovie = (item: MediaDto) => {
    router.push(`/movie/${item.id}?type=${item.mediaType || 'movie'}`);
  };

  const renderRow = (title: string, items?: MediaDto[]) => (
    <ThemedView style={styles.rowSection}>
      <ThemedText type="subtitle" style={styles.rowTitle}>
        {title}
      </ThemedText>
      <FlatList
        data={items ?? []}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowContent}
        renderItem={({ item }) => {
          return (
            <MediaCard
              item={item}
              onPress={handlePressMovie}
              width={isMobile ? 130 : 160}
              baseUrl={baseUrl}
              style={styles.posterCard}
            />
          );
        }}
      />
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#111111', dark: '#0F0F0F' }}
      headerImage={
        heroPoster ? (
          <Image
            source={{ uri: heroPoster }}
            style={[styles.heroImage, { height: isMobile ? 350 : 500 }]}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.heroPlaceholder, { height: isMobile ? 350 : 500 }]} />
        )
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.titleText}>
          WatchList
        </ThemedText>
        <ThemedText style={styles.subtitleText}>Find your next obsession.</ThemedText>
      </ThemedView>

      {heroItem ? (
        <Pressable style={styles.heroCard} onPress={() => handlePressMovie(heroItem)}>
          <ThemedText type="subtitle" style={styles.heroTitle}>
            {heroItem.title}
          </ThemedText>
          <ThemedText numberOfLines={3} style={styles.heroCaption}>
            Trending now
          </ThemedText>
        </Pressable>
      ) : null}

      {renderRow('Trending Now', trending?.items ?? [])}
      {renderRow('New Releases', discover?.items ?? [])}
    </ParallaxScrollView>
  );
}

export default function HomeScreen() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}


const styles = StyleSheet.create({
  titleContainer: {
    gap: 4,
    marginBottom: 16,
  },
  titleText: {
    fontFamily: Fonts.sans,
    letterSpacing: 0.4,
  },
  subtitleText: {
    color: '#B0B0B0',
  },
  heroImage: {
    width: '100%',
    height: 320,
  },
  heroPlaceholder: {
    width: '100%',
    height: 320,
    backgroundColor: '#1E1E1E',
  },
  heroCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
  },
  heroTitle: {
    fontSize: 22,
  },
  heroCaption: {
    color: '#9C9C9C',
    marginTop: 6,
  },
  rowSection: {
    marginBottom: 24,
  },
  rowTitle: {
    marginBottom: 12,
  },
  rowContent: {
    gap: 12,
    paddingRight: 12,
  },
  posterCard: {
    gap: 8,
  },
});
