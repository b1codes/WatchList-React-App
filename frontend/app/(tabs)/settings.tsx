import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/config/firebase';

export default function SettingsScreen() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText style={styles.subtitle}>Manage your account settings.</ThemedText>

      <View style={styles.card}>
        <ThemedText type="defaultSemiBold">Current User</ThemedText>
        <ThemedText style={styles.userId}>{user?.email ?? 'Unknown'}</ThemedText>
        <Pressable style={styles.button} onPress={handleSignOut}>
          <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  subtitle: {
    color: '#9C9C9C',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    gap: 10,
  },
  userId: {
    color: '#CFCFCF',
  },
  button: {
    marginTop: 6,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
  },
  buttonText: {
    color: '#EDEDED',
  },
});
