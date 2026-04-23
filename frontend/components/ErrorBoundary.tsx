import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <ThemedView style={styles.container}>
      <IconSymbol size={64} name="exclamationmark.triangle.fill" color="#F5C518" />
      <ThemedText type="subtitle" style={styles.title}>
        Something went wrong
      </ThemedText>
      <ThemedText style={styles.message}>
        {error.message || 'An unexpected error occurred while rendering this screen.'}
      </ThemedText>
      <Pressable style={styles.button} onPress={resetErrorBoundary}>
        <ThemedText style={styles.buttonText}>Try Again</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Optional: clear any state that might have caused the error
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#9C9C9C',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#F5C518',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#121212',
    fontWeight: 'bold',
  },
});
