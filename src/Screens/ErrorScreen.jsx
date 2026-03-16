import React from 'react';
import {View} from 'react-native';
import {ErrorWidget} from '../Widgets/ErrorsWidgets';
import { useErrorScreenStyles } from '../Styles/components/Screens/ErrorScreenStyles';

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
  const s = useErrorScreenStyles();
  return (
    <View style={s.container}>
      <ErrorWidget title={title} message={message} onRetry={onRetry} />
    </View>
  );
};
