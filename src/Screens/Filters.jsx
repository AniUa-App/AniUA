import {View, Text} from 'react-native';
import {TouchableOpacity} from '../Widgets/Button';
import React from 'react';
import {Fonts} from '../Styles/Fonts';

export default function FiltersScreen() {
  const fontsLoaded = Fonts();

  if (!fontsLoaded) {
    return null; // Або відображення екрану завантаження
  }

  return (
    <View style={{flex: 1, backgroundColor: '#2F3235', position: 'relative'}}>
      {/* Заголовок екрану */}
      <Text
        style={{
          color: '#ffffff',
          fontSize: 20,
          marginTop: 20,
          backgroundColor: '#323B44',
          width: '90%',
          padding: 10,
          alignSelf: 'center',
          textAlign: 'center',
          borderRadius: 19,
          fontFamily: 'RobotoCondensed-Background',
          textShadowColor: '#000000',
          textShadowOffset: {width: 2, height: 2},
          textShadowRadius: 4,
        }}>
        Фільтри для пошуку аніме
      </Text>

      {/* Контейнер с жанрами */}
      <View
        style={{
          marginTop: 50,
          backgroundColor: '#8293B6',
          width: '90%',
          alignSelf: 'center',
          borderRadius: 30,
          borderColor: '#595A79',
          padding: 10,
          borderWidth: 2,
          position: 'relative',
        }}>
        {/* Заголовок сверху */}
        <View
          style={{
            position: 'absolute',
            top: -9,
            left: '10%',
            right: '10%',
            backgroundColor: '#6B7A99',
            borderRadius: 15,
            paddingVertical: 5,
            alignSelf: 'center',
            borderWidth: 2,
            borderColor: '#595A79',
            height: 15,
            shadowColor: '#000',
            shadowOffset: {width: -5, height: 5},
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 10,
          }}>
          <Text
            style={{
              top: -15,
              color: '#ffffff',
              fontSize: 16,
              fontFamily: 'RobotoCondensed-Background',
              textAlign: 'center',
              zIndex: 1,
              height: 25,
            }}>
            ЗА ЖАНРОМ:
          </Text>
        </View>

        {/* Контент внутри */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 10,
          }}>
          {/* Жанри */}
          {Array.from({length: 20}).map((_, index) => (
            <Text
              key={index}
              style={{
                color: '#ffffff',
                fontSize: 17,
                textAlign: 'center',
                fontFamily: 'RobotoCondensed-Background',
                shadowColor: '#000',
                shadowOffset: {width: 5, height: 5},
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 10,
                marginRight: 5,
              }}>
              Жанр{index + 1},
            </Text>
          ))}
        </View>
      </View>

      {/* Кнопка знизу */}
      <TouchableOpacity
        style={{
          position: 'absolute', // Розміщуємо знизу
          bottom: 20, // Відступ від нижньої межі
          alignSelf: 'center', // Центруємо по горизонталі
          backgroundColor: '#575C81',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 30,
          borderColor: '#454966',
          borderWidth: 2,
          height: 50,
          width: '90%',
        }}>
        <Text
          style={{
            fontSize: 29,
            lineHeight: 50, // Вирівнюємо текст по висоті кнопки
            color: '#fff',
            textAlign: 'center', // Текст по центру горизонтально
            fontFamily: 'RobotoCondensed-Background',
            textShadowColor: '#000',
            textShadowOffset: {width: 2, height: 2},
            textShadowRadius: 4,
            elevation: 10,
          }}>
          ШУКАТЬ
        </Text>
      </TouchableOpacity>
    </View>
  );
}
