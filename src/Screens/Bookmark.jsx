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

//*  Кольори вкладок та лінії
const routeColors = {
  Plans: '#5F77B6', // колір фону "У планах"
  Watching: '#D6AA63', // колір фону "Дивлюсь"
  Viewed: '#ADD8E6', // колір фону "Переглянуто"
  Dropped: '#E4837A', // колір фону "Покинуто"
};

//* Темніші відтінки для нижньої лінії
const routeBorderColors = {
  Plans: '#384A79', // темніший синій
  Watching: '#FFEA4F', // темніший золотистий
  Viewed: '#00B0E9', // темніший блакитно-зелений
  Dropped: '#FF2511', // темніший червоний
};

const textColor = {
  Plans: '#6691FD',
  Watching: '#FFE5AE',
  Viewed: '#ADD8E6',
  Dropped: '#FF897E',
};

//* Кастомний таб-бар
function CustomTabBar({state, descriptors, navigation}) {
  return (
    <View style={{flexDirection: 'row'}}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const {options} = descriptors[route.key];

        // Визначаємо фон вкладки
        const backgroundColor = isFocused
          ? routeColors[route.name] // колір вкладки, якщо активна
          : '#4A4B4D'; // сірий, якщо не активна

        // Лінія знизу — темніший колір, якщо активна; "прозора", якщо ні
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
            activeOpacity={1} // <-- додаємо це
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

// Основний навігатор з нашим кастомним таб-баром
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
