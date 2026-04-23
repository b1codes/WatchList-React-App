
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MediaDto } from '@/constants/types';
import { useMemo } from 'react';

type MediaCardProps = {
    item: MediaDto;
    onPress: (item: MediaDto) => void;
    width: number;
    baseUrl?: string | null;
    style?: ViewStyle;
};

export function MediaCard({ item, onPress, width, baseUrl, style }: MediaCardProps) {
    const posterUrl = useMemo(() => {
        if (!baseUrl || !item.posterPath) return null;
        return `${baseUrl}w342${item.posterPath}`;
    }, [baseUrl, item.posterPath]);

    const name = item.title || 'Untitled';

    // Determine media type label. Default to 'Movie' if not 'tv'.
    const isTv = item.mediaType === 'tv';
    const typeLabel = isTv ? 'TV' : 'Movie';

    // Define chip color based on type for better visual distinction (optional, but good for UI)
    const chipColor = isTv ? '#E50914' : '#F5C518';
    // Netflix Red for TV, IMDb Yellow for Movie (just example colors, can fit theme)
    // Let's stick to a neutral semi-transparent style for now as per plan, 
    // or maybe use the app's existing color palette. 
    // Plan said: "Small, semi-transparent background, white text, rounded corners."

    return (
        <Pressable
            onPress={() => onPress(item)}
            style={[styles.container, { width }, style]}>
            <View style={styles.imageContainer}>
                {posterUrl ? (
                    <Image
                        source={{ uri: posterUrl }}
                        style={styles.image}
                        contentFit="cover"
                        transition={400}
                    />
                ) : (
                    <View style={styles.placeholder} />
                )}

                {/* Component Chip */}
                <View style={styles.chip}>
                    <ThemedText style={styles.chipText}>{typeLabel}</ThemedText>
                </View>
            </View>

            <ThemedText numberOfLines={2} style={styles.label}>
                {name}
            </ThemedText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 2 / 3,
        borderRadius: 14,
        overflow: 'hidden', // Ensure chip doesn't overflow corners
        backgroundColor: '#2A2A2A',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2A2A2A',
    },
    label: {
        fontSize: 12,
        color: '#D8D8D8',
    },
    chip: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backdropFilter: 'blur(4px)', // Works on some platforms, ignored on others
    },
    chipText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
