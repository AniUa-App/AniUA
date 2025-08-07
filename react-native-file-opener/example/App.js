import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import FileOpener from '../index';

const App = () => {
  const [fileInfo, setFileInfo] = useState(null);

  const testFile = '/storage/emulated/0/Download/test.pdf'; // Приклад шляху

  const openFile = async () => {
    try {
      await FileOpener.openFile(testFile, 'application/pdf');
      Alert.alert('Успіх', 'Файл відкрито успішно');
    } catch (error) {
      Alert.alert('Помилка', `Не вдалося відкрити файл: ${error.message}`);
    }
  };

  const openFileAuto = async () => {
    try {
      await FileOpener.openFileAuto(testFile);
      Alert.alert('Успіх', 'Файл відкрито успішно');
    } catch (error) {
      Alert.alert('Помилка', `Не вдалося відкрити файл: ${error.message}`);
    }
  };

  const checkFileExists = async () => {
    try {
      const exists = await FileOpener.checkFileExists(testFile);
      Alert.alert('Результат', exists ? 'Файл існує' : 'Файл не існує');
    } catch (error) {
      Alert.alert('Помилка', `Помилка перевірки: ${error.message}`);
    }
  };

  const getFileInfo = async () => {
    try {
      const info = await FileOpener.getFileInfo(testFile);
      setFileInfo(info);
      Alert.alert('Успіх', 'Інформацію про файл отримано');
    } catch (error) {
      Alert.alert('Помилка', `Помилка отримання інформації: ${error.message}`);
    }
  };

  const getMimeType = async () => {
    try {
      const mimeType = await FileOpener.getMimeType(testFile);
      Alert.alert('MIME тип', mimeType);
    } catch (error) {
      Alert.alert('Помилка', `Помилка отримання MIME типу: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>React Native File Opener</Text>
          <Text style={styles.subtitle}>Приклад використання</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={openFile}>
            <Text style={styles.buttonText}>Відкрити файл (з MIME типом)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={openFileAuto}>
            <Text style={styles.buttonText}>Відкрити файл (авто)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={checkFileExists}>
            <Text style={styles.buttonText}>Перевірити існування</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={getFileInfo}>
            <Text style={styles.buttonText}>Отримати інформацію</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={getMimeType}>
            <Text style={styles.buttonText}>Отримати MIME тип</Text>
          </TouchableOpacity>
        </View>

        {fileInfo && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Інформація про файл:</Text>
            <Text style={styles.infoText}>Шлях: {fileInfo.path}</Text>
            <Text style={styles.infoText}>Назва: {fileInfo.name}</Text>
            <Text style={styles.infoText}>Існує: {fileInfo.exists ? 'Так' : 'Ні'}</Text>
            <Text style={styles.infoText}>Файл: {fileInfo.isFile ? 'Так' : 'Ні'}</Text>
            <Text style={styles.infoText}>Папка: {fileInfo.isDirectory ? 'Так' : 'Ні'}</Text>
            <Text style={styles.infoText}>Можна читати: {fileInfo.canRead ? 'Так' : 'Ні'}</Text>
            <Text style={styles.infoText}>Можна писати: {fileInfo.canWrite ? 'Так' : 'Ні'}</Text>
            <Text style={styles.infoText}>Розмір: {fileInfo.size} байт</Text>
            <Text style={styles.infoText}>Остання зміна: {fileInfo.lastModified}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default App; 