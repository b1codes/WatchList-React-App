import { useMemo } from 'react';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MediaCard } from '@/components/MediaCard';
import { CreateWatchListItemRequest, MediaDto } from '@/constants/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  useGetMovieConfigQuery,
  useGetMovieDetailsQuery,
  useGetSimilarMoviesQuery,
  useGetRecommendedMoviesQuery,
} from '@/store/api/tmdbApi';
import {
  useGetWatchlistInfiniteQuery,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
} from '@/store/api/watchlistApi';

const buildImageUrl = (baseUrl: string | null, size: string, path?: string | null) => {
  if (!baseUrl || !path) return null;
  return `${baseUrl}${size}${path}`;
};

function MovieDetailsContent() {
  const router = useRouter();
  const { id, type: typeParam } = useLocalSearchParams();
  const movieId = Number(Array.isArray(id) ? id[0] : id);
  const mediaType = (Array.isArray(typeParam) ? typeParam[0] : typeParam) || 'movie';

  const skip = !Number.isFinite(movieId) || movieId <= 0;

  const { data: config } = useGetMovieConfigQuery();
  const { data: detailsData } = useGetMovieDetailsQuery({ id: movieId, type: mediaType }, { skip });
  const { data: watchlistData } = useGetWatchlistInfiniteQuery(20);
  const { data: similarData } = useGetSimilarMoviesQuery({ id: movieId, page: 1, type: mediaType }, { skip });
  const { data: recommendedData } = useGetRecommendedMoviesQuery({ id: movieId, page: 1, type: mediaType }, { skip });

  const [addToWatchlist] = useAddToWatchlistMutation();
  const [removeFromWatchlist] = useRemoveFromWatchlistMutation();

  const baseUrl = config?.images?.secure_base_url ?? null;
  const details = detailsData?.details ?? null;
  const posterUrl = buildImageUrl(baseUrl, 'w780', details?.posterPath);

  const title = details?.title ?? 'Loading...';
  const releaseYear = details?.releaseDate ? details.releaseDate.slice(0, 4) : null;
  const runtime = details?.runtime;

  const isInWatchlist = Boolean(
    watchlistData?.pages.flatMap((p) => p?.items ?? []).some((item) => item.tmdbId === movieId),
  );

  const handleToggleWatchlist = async () => {
    if (!details) return;
    if (isInWatchlist) {
      const result = await removeFromWatchlist(movieId);
      if (!('error' in result)) void Haptics.selectionAsync();
      return;
    }
    const payload: CreateWatchListItemRequest = {
      tmdbId: movieId,
      title,
      type: mediaType,
      posterPath: details.posterPath ?? null,
      releaseYear: releaseYear ? Number(releaseYear) : null,
    };
    const result = await addToWatchlist(payload);
    if (!('error' in result)) void Haptics.selectionAsync();
  };

  const providers = useMemo(() => {
    const regionMap = detailsData?.providers?.results ?? {};
    return regionMap.US ?? Object.values(regionMap)[0] ?? null;
  }, [detailsData?.providers?.results]);

  const cast = details?.cast?.slice(0, 15) ?? [];

  const handlePressMovie = (item: MediaDto) => {
    router.push(`/movie/${item.id}?type=${item.mediaType || mediaType}`);
  };

  const renderRow = (rowTitle: string, items?: MediaDto[]) => {
    if (!items || items.length === 0) return null;
    return (
      <ThemedView style={styles.rowSection}>
        <ThemedText type="subtitle" style={styles.rowTitle}>
          {rowTitle}
        </ThemedText>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
          renderItem={({ item }) => (
            <MediaCard
              item={item}
              onPress={handlePressMovie}
              width={130}
              baseUrl={baseUrl}
              style={styles.posterCard}
            />
          )}
        />
      </ThemedView>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#111111', dark: '#0F0F0F' }}
      headerImage={
        posterUrl ? (
          <View style={styles.headerImageContainer}>
            <Image source={{ uri: posterUrl }} style={styles.heroImage} contentFit="cover" />
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          </View>
        ) : (
          <View style={styles.heroPlaceholder} />
        )
      }>

      <View style={styles.contentContainer}>
        <View style={styles.heroRow}>
          <Image
            source={{ uri: posterUrl ?? undefined }}
            style={styles.posterImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroInfo}>
            <ThemedText type="title" style={styles.titleText}>
              {title}
            </ThemedText>
            <ThemedText style={styles.subtitleText}>
              {releaseYear
                ? `${releaseYear} · ${runtime ? `${runtime} min` : 'Runtime n/a'}`
                : 'Runtime unavailable'}
            </ThemedText>
            <View style={styles.actionRow}>
              <Pressable
                onPress={handleToggleWatchlist}
                style={[styles.fab, isInWatchlist ? styles.fabActive : null]}>
                <IconSymbol
                  size={20}
                  name={isInWatchlist ? 'checkmark' : 'plus'}
                  color={isInWatchlist ? '#111111' : '#EDEDED'}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {details?.tagline ? (
          <ThemedText style={styles.tagline}>{details.tagline}</ThemedText>
        ) : null}

        {details?.overview ? (
          <ThemedText style={styles.overview}>{details.overview}</ThemedText>
        ) : null}

        {cast.length > 0 && (
          <View style={styles.sectionContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Top Cast</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castScroll}>
              {cast.map((member) => (
                <View key={member.id} style={styles.castCard}>
                  <Image
                    source={{ uri: buildImageUrl(baseUrl, 'w185', member.profilePath) ?? undefined }}
                    style={styles.castImage}
                    contentFit="cover"
                  />
                  <ThemedText numberOfLines={1} style={styles.castName}>{member.name}</ThemedText>
                  <ThemedText numberOfLines={1} style={styles.castCharacter}>{member.character}</ThemedText>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {providers ? (
          <ThemedView style={styles.providersSection}>
            <ThemedText type="subtitle" style={styles.providersTitle}>
              Where to Watch
            </ThemedText>
            <View style={styles.providerRow}>
              {(providers.flatrate ?? []).slice(0, 6).map((provider) => {
                const logoUrl = buildImageUrl(baseUrl, 'w154', provider.logo_path);
                if (!logoUrl) return null;
                return (
                  <Image
                    key={provider.provider_id}
                    source={{ uri: logoUrl }}
                    style={styles.providerLogo}
                    contentFit="cover"
                    transition={300}
                  />
                );
              })}
            </View>
          </ThemedView>
        ) : null}

        {renderRow('Similar Movies', similarData?.items)}
        {renderRow('Recommended For You', recommendedData?.items)}
      </View>
    </ParallaxScrollView>
  );
}

export default function MovieDetailsScreen() {
  return (
    <ErrorBoundary>
      <MovieDetailsContent />
    </ErrorBoundary>
  );
}


const styles = StyleSheet.create({
  headerImageContainer: {
    width: '100%',
    height: 380,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: 380,
    backgroundColor: '#1E1E1E',
  },
  contentContainer: {
    gap: 16,
    paddingBottom: 32,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  posterImage: {
    width: 100,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  heroInfo: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 24,
    lineHeight: 28,
  },
  subtitleText: {
    fontSize: 14,
    color: '#B5B5B5',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
  },
  fabActive: {
    backgroundColor: '#F5C518',
  },
  tagline: {
    color: '#E0E0E0',
    fontStyle: 'italic',
    marginTop: 4,
  },
  overview: {
    color: '#C7C7C7',
    lineHeight: 22,
    fontSize: 15,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  castScroll: {
    gap: 12,
  },
  castCard: {
    width: 100,
  },
  castImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2A2A2A',
    marginBottom: 8,
  },
  castName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  castCharacter: {
    fontSize: 10,
    color: '#B5B5B5',
    textAlign: 'center',
  },
  providersSection: {
    marginTop: 24,
  },
  providersTitle: {
    marginBottom: 12,
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  providerLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  rowSection: {
    marginTop: 24,
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
