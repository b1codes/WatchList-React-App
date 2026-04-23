import { useMemo } from 'react';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, View, FlatList } from 'react-native';

import { fetchMovieConfig, getMovieDetails, getSimilarMovies, getRecommendedMovies } from '@/api/tmdb';
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '@/api/watchlist';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MediaCard } from '@/components/MediaCard';
import { CreateWatchListItemRequest, MediaDto } from '@/constants/types';

import { ErrorBoundary } from '@/components/ErrorBoundary';

const buildImageUrl = (baseUrl: string | null, size: string, path?: string | null) => {
  if (!baseUrl || !path) return null;
  return `${baseUrl}${size}${path}`;
};

function MovieDetailsContent() {
  const router = useRouter();
  const { id, type: typeParam } = useLocalSearchParams();
  const movieId = Number(Array.isArray(id) ? id[0] : id);
  const mediaType = (Array.isArray(typeParam) ? typeParam[0] : typeParam) || 'movie';
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: ['tmdb-config'],
    queryFn: fetchMovieConfig,
  });

  const detailsQuery = useQuery({
    queryKey: ['movie-details', movieId, mediaType],
    queryFn: () => getMovieDetails(movieId, mediaType),
    enabled: Number.isFinite(movieId) && movieId > 0,
  });

  const watchlistQuery = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => getWatchlist(),
  });

  const similarQuery = useQuery({
    queryKey: ['similar-movies', movieId, mediaType],
    queryFn: () => getSimilarMovies(movieId, 1, mediaType),
    enabled: Number.isFinite(movieId) && movieId > 0,
  });

  const recommendedQuery = useQuery({
    queryKey: ['recommended-movies', movieId, mediaType],
    queryFn: () => getRecommendedMovies(movieId, 1, mediaType),
    enabled: Number.isFinite(movieId) && movieId > 0,
  });

  const addMutation = useMutation({
    mutationFn: addToWatchlist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      void Haptics.selectionAsync();
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWatchlist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      void Haptics.selectionAsync();
    },
  });

  const baseUrl = configQuery.data?.images?.secure_base_url ?? null;
  const details = detailsQuery.data?.details ?? null;
  const posterUrl = buildImageUrl(baseUrl, 'w780', details?.posterPath);

  const title = details?.title ?? 'Loading...';
  const releaseYear = details?.releaseDate ? details.releaseDate.slice(0, 4) : null;
  const runtime = details?.runtime;

  const isInWatchlist = Boolean(
    watchlistQuery.data?.items?.some((item) => item.tmdbId === movieId),
  );

  const handleToggleWatchlist = () => {
    if (!details) return;
    if (isInWatchlist) {
      removeMutation.mutate(movieId);
      return;
    }

    const payload: CreateWatchListItemRequest = {
      tmdbId: movieId,
      title: title,
      type: mediaType,
      posterPath: details.posterPath ?? null,
      releaseYear: releaseYear ? Number(releaseYear) : null,
    };

    addMutation.mutate(payload);
  };

  const providers = useMemo(() => {
    const regionMap = detailsQuery.data?.providers?.results ?? {};
    return regionMap.US ?? Object.values(regionMap)[0] ?? null;
  }, [detailsQuery.data?.providers?.results]);

  const cast = details?.cast?.slice(0, 15) ?? [];

  const handlePressMovie = (item: MediaDto) => {
    // using router.push adds it to the navigation stack
    router.push(`/movie/${item.id}?type=${item.mediaType || mediaType}`);
  };

  const renderRow = (title: string, items?: MediaDto[]) => {
    if (!items || items.length === 0) return null;
    return (
      <ThemedView style={styles.rowSection}>
        <ThemedText type="subtitle" style={styles.rowTitle}>
          {title}
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
              {/* Optional: Add more buttons here later */}
            </View>
          </View>
        </View>

        {details?.tagline ? (
          <ThemedText style={styles.tagline}>{details.tagline}</ThemedText>
        ) : null}

        {details?.overview ? (
          <ThemedText style={styles.overview}>{details.overview}</ThemedText>
        ) : null}

        {/* Cast Section */}
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

        {renderRow('Similar Movies', similarQuery.data?.items)}
        {renderRow('Recommended For You', recommendedQuery.data?.items)}
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
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  metaLabel: {
    fontWeight: 'bold',
    color: '#EDEDED',
  },
  metaValue: {
    color: '#C7C7C7',
    flex: 1,
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
    borderRadius: 50, // Circular
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