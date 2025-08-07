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
import {appColor, black, Black_1} from '../Styles/Colors';
import Icon from '../Styles/Icons';
import MainConfig from '../cfgs/MainConfig';
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

/**
 * Перетаскиваемая панель тестирования ошибок
 */
export const ErrorTestComponent = () => {
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [side, setSide] = useState('right'); // 'left', 'right', 'top-left', 'top-right'

  // Анимированные позиции
  const pan = useRef(
    new Animated.ValueXY({
      x: screenWidth - 210, // Увеличил отступ для ширины 200px
      y: screenHeight - 280, // Увеличил отступ для высоты 270px
    }),
  ).current;

  // Показуємо тільки коли ввімкнено режим розробника
  if (!MainConfig.debug.isErrorBoundary) {
    return null;
  }

  // Функция привязки к ближайшей стороне
  const snapToSide = gestureState => {
    const {dx, dy} = gestureState;
    const currentX = pan.x._value + dx;
    const currentY = pan.y._value + dy;

    // Скорректированные размеры панели с учетом иконки 30x30
    const panelWidth = isMinimized ? 140 : 200; // Увеличил для иконки 30px
    const panelHeight = isMinimized ? 80 : 270; // Увеличил высоту заголовка
    const margin = 10;

    // Определяем к какой стороне ближе
    const centerX = currentX + panelWidth / 2;
    const centerY = currentY + panelHeight / 2;

    const isLeft = centerX < screenWidth / 2;
    const isTop = centerY < screenHeight / 2;

    let newX, newY, newSide;

    if (isTop) {
      // Верхняя половина экрана
      newY = 50; // Отступ от верха
      if (isLeft) {
        newX = margin;
        newSide = 'top-left';
      } else {
        newX = screenWidth - panelWidth - margin;
        newSide = 'top-right';
      }
    } else {
      // Нижняя половина экрана
      newY = screenHeight - panelHeight - 50; // Отступ от низа
      if (isLeft) {
        newX = margin;
        newSide = 'left';
      } else {
        newX = screenWidth - panelWidth - margin;
        newSide = 'right';
      }
    }

    // Дополнительная проверка границ экрана
    newX = Math.max(margin, Math.min(newX, screenWidth - panelWidth - margin));
    newY = Math.max(50, Math.min(newY, screenHeight - panelHeight - 50));

    setSide(newSide);

    // Анимируем к новой позиции
    Animated.spring(pan, {
      toValue: {x: newX, y: newY},
      useNativeDriver: false,
      tension: 120, // Увеличил tension для более быстрой анимации
      friction: 9, // Увеличил friction для более мягкой остановки
    }).start();
  };

  // PanResponder для перетаскивания
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

    // Пересчитываем позицию после изменения размера
    setTimeout(() => {
      snapToSide({dx: 0, dy: 0}); // Пересчитываем для текущей позиции
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
        <Icon.Bug size={30} color={appColor} />
      </TouchableOpacity>

      {/* Кнопки тестирования */}
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
    backgroundColor: Black_1(0.95),
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
    width: 200, // Финальная ширина с учетом иконки 30px
  },
  containerMinimized: {
    width: 140, // Финальная ширина минимизированной версии
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: black,
    minHeight: 50, // Увеличил для комфортного размещения иконки 30px
  },
  title: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10, // Увеличил отступ от иконки 30px
  },
  sideIndicator: {
    fontSize: 16,
    marginLeft: 8,
  },
  buttonsContainer: {
    padding: 8,
  },
  button: {
    backgroundColor: black,
    padding: 10,
    borderRadius: 6,
    marginVertical: 3,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
