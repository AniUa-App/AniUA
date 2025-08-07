import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ErrorWidget} from '../Widgets/ErrorsWidgets';

/**
 * @typedef {Object} ErrorScreenProps
 * @property {string} [title] - Заголовок помилки
 * @property {string} message - Повідомлення про помилку
 * @property {Function} [onRetry] - Функція для повторної спроби
 */

/**
 * Компонент екрану помилки
 * @param {ErrorScreenProps} props - Властивості компонента
 * @returns {JSX.Element} Компонент екрану помилки
 */
export const ErrorScreen = ({title, message, onRetry}) => {
  return (
    <View style={styles.container}>
      <ErrorWidget title={title} message={message} onRetry={onRetry} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
