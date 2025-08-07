import React from 'react';
import DefaultScreenWidget from '../Widgets/DefaultScreenWidget';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {View, Text} from 'react-native';
import {TouchableOpacity} from '../Widgets/Button';
import BookmarkTabsScreen from './BookmarkTabs';
import SearchLine from '../Widgets/SearchLineWidget';
import {TabBookmark} from './ScreenController/Navigators';

// Создаём навигатор

const styles = {
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

//*  Цвета вкладок и линии
const routeColors = {
  Plans: '#5F77B6', // цвет фона "У планах"
  Watching: '#D6AA63', // цвет фона "Дивлюсь"
  Viewed: '#ADD8E6', // цвет фона "Переглянуто"
  Dropped: '#E4837A', // цвет фона "Покинуто"
};

//* Более тёмные оттенки для нижней линии
const routeBorderColors = {
  Plans: '#384A79', // темнее синего
  Watching: '#FFEA4F', // темнее золотистого
  Viewed: '#00B0E9', // темнее голубовато-зелёного
  Dropped: '#FF2511', // темнее красного
};

const textColor = {
  Plans: '#6691FD',
  Watching: '#FFE5AE',
  Viewed: '#ADD8E6',
  Dropped: '#FF897E',
};

//* Кастомный таб-бар
function CustomTabBar({state, descriptors, navigation}) {
  return (
    <View style={{flexDirection: 'row'}}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const {options} = descriptors[route.key];

        // Определяем фон вкладки
        const backgroundColor = isFocused
          ? routeColors[route.name] // цвет вкладки, если активна
          : '#4A4B4D'; // серый, если не активна

        // Линия внизу — более тёмный цвет, если активна; "прозрачная", если нет
        const borderBottomColor = isFocused
          ? routeBorderColors[route.name]
          : 'transparent';

        const color = isFocused ? textColor[route.name] : '#B5B5B5';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.name}
            onPress={onPress}
            activeOpacity={1} // <-- добавляем это
            style={{
              flex: 1,
              borderBottomColor,
              backgroundColor,
              justifyContent: 'center',
              alignItems: 'center',
              height: 50,
              borderBottomWidth: 3,
            }}>
            <Text
              style={{
                color,
                fontSize: 12,
                letterSpacing: 1,
                textTransform: 'uppercase',
                textShadowColor: '#474747',
                fontWeight: 'bold',
                textShadowRadius: 5,
                marginTop: 10,
              }}>
              {options.title || route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Основной навигатор с нашим кастомным таб-баром
export default function BookmarkScreen() {
  return (
    <View style={{flex: 1}}>
      <SearchLine />
      <TabBookmark.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          swipeEnabled: false,
          indicatorStyle: {backgroundColor: 'transparent'},
        }}>
        <TabBookmark.Screen
          name="Plans"
          component={BookmarkTabsScreen}
          options={{title: 'У планах'}}
        />
        <TabBookmark.Screen
          name="Watching"
          component={BookmarkTabsScreen}
          options={{title: 'Дивлюсь'}}
        />
        <TabBookmark.Screen
          name="Viewed"
          component={BookmarkTabsScreen}
          options={{title: 'Оглянуто'}}
        />
        <TabBookmark.Screen
          name="Dropped"
          component={BookmarkTabsScreen}
          options={{title: 'Покинуто'}}
        />
      </TabBookmark.Navigator>
    </View>
  );
}
