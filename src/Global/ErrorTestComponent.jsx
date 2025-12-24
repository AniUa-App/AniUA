import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import {DEBUGCONFIG} from '../cfgs/DebugConfig';
import {primary, background, Subtle} from '../Styles/Colors';
import Icon from '../Styles/Icons';
import MainConfig from '../cfgs/MainConfig';
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

/**
 * Перетягувана панель тестування помилок
 */
export const ErrorTestComponent = () => {
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [side, setSide] = useState('right'); // 'left', 'right', 'top-left', 'top-right'

  // Анімовані позиції
  const pan = useRef(
    new Animated.ValueXY({
      x: screenWidth - 210, // Збільшено відступ для ширини 200px
      y: screenHeight - 280, // Збільшено відступ для висоти 270px
    }),
  ).current;

  // Показуємо тільки коли ввімкнено режим розробника
  if (!MainConfig.debug.isErrorBoundary) {
    return null;
  }

  // Функція прив'язки до найближчої сторони
  const snapToSide = gestureState => {
    const {dx, dy} = gestureState;
    const currentX = pan.x._value + dx;
    const currentY = pan.y._value + dy;

    // Скориговані розміри панелі з урахуванням іконки 30x30
    const panelWidth = isMinimized ? 140 : 200; // Збільшено для іконки 30px
    const panelHeight = isMinimized ? 80 : 270; // Збільшено висоту заголовка
    const margin = 10;

    // Визначаємо до якої сторони ближче
    const centerX = currentX + panelWidth / 2;
    const centerY = currentY + panelHeight / 2;

    const isLeft = centerX < screenWidth / 2;
    const isTop = centerY < screenHeight / 2;

    let newX, newY, newSide;

    if (isTop) {
      // Верхня половина екрану
      newY = 50; // Відступ від верху
      if (isLeft) {
        newX = margin;
        newSide = 'top-left';
      } else {
        newX = screenWidth - panelWidth - margin;
        newSide = 'top-right';
      }
    } else {
      // Нижня половина екрану
      newY = screenHeight - panelHeight - 50; // Відступ від низу
      if (isLeft) {
        newX = margin;
        newSide = 'left';
      } else {
        newX = screenWidth - panelWidth - margin;
        newSide = 'right';
      }
    }

    // Додаткова перевірка меж екрану
    newX = Math.max(margin, Math.min(newX, screenWidth - panelWidth - margin));
    newY = Math.max(50, Math.min(newY, screenHeight - panelHeight - 50));

    setSide(newSide);

    // Анімуємо до нової позиції
    Animated.spring(pan, {
      toValue: {x: newX, y: newY},
      useNativeDriver: false,
      tension: 120, // Збільшено tension для швидшої анімації
      friction: 9, // Збільшено friction для м'якшої зупинки
    }).start();
  };

  // PanResponder для перетягування
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (evt, gestureState) => {
      pan.flattenOffset();
      snapToSide(gestureState);
    },
  });

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);

    // Перераховуємо позицію після зміни розміру
    setTimeout(() => {
      snapToSide({dx: 0, dy: 0}); // Перераховуємо для поточної позиції
    }, 100);
  };

  const throwRenderError = () => {
    setShouldThrowError(true);
  };

  const throwAsyncError = () => {
    setTimeout(() => {
      throw new Error('Тестова асинхронна помилка');
    }, 1000);
  };

  const throwNetworkError = () => {
    throw new Error('Network request failed: Unable to connect to server');
  };

  const throwUndefinedError = () => {
    const obj = null;
    console.log(obj.someProperty);
  };

  if (shouldThrowError) {
    throw new Error('Тестова помилка рендерингу');
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isMinimized && styles.containerMinimized,
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}>
      {/* Заголовок */}
      <TouchableOpacity onPress={toggleMinimize} style={styles.header}>
        <Text style={styles.title}>
          {isMinimized ? 'Продв. фун.' : 'Продвинуті функції'}
        </Text>
        <Icon.Bug size={30} color={primary} />
      </TouchableOpacity>

      {/* Кнопки тестування */}
      {!isMinimized && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={throwRenderError}>
            <Text style={styles.buttonText}>Помилка рендерингу</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={throwAsyncError}>
            <Text style={styles.buttonText}>Асинхронна помилка</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={throwNetworkError}>
            <Text style={styles.buttonText}>Мережева помилка</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={throwUndefinedError}>
            <Text style={styles.buttonText}>Undefined помилка</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: Subtle(0.95),
    borderRadius: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    width: 200, // Фінальна ширина з урахуванням іконки 30px
  },
  containerMinimized: {
    width: 140, // Фінальна ширина мінімізованої версії
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: background,
    minHeight: 50, // Збільшено для комфортного розміщення іконки 30px
  },
  title: {
    color: 'text',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10, // Збільшено відступ від іконки 30px
  },
  sideIndicator: {
    fontSize: 16,
    marginLeft: 8,
  },
  buttonsContainer: {
    padding: 8,
  },
  button: {
    backgroundColor: background,
    padding: 10,
    borderRadius: 6,
    marginVertical: 3,
    alignItems: 'center',
  },
  buttonText: {
    color: 'text',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
