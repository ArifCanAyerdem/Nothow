import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';

export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Create an Account (Register) Page</Text>
      <Link href="/home" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Kayıt Ol ve Kasaya Gir</Text>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
