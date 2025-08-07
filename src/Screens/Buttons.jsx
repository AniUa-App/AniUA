import {View, Text} from 'react-native';
import React, {useEffect, useCallback} from 'react';
import DefaultScreenWidget from '../Widgets/DefaultScreenWidget';
import {TouchableOpacity} from '../Widgets/Button';
import {useFocusEffect} from '@react-navigation/native';
import {H3, H4, H5} from '../Styles/Fonts';
import {appColor} from '../Styles/Colors';

export default function ButtonsScreen({route}) {
  const {list, title, buttonStyle} = route.params;
  useEffect(() => {
    console.log(list);
  }, [list]);
  useFocusEffect(
    useCallback(() => {
      console.log(list);
    }, [list]),
  );
  return (
    <DefaultScreenWidget>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          padding: 20,
          gap: 10,
        }}>
        {list.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              {
                minWidth: '20%', // Мінімальна ширина елемента
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: appColor,
                borderRadius: 8,
                padding: 10,
                minHeight: 50,
              },
              buttonStyle,
            ]}
            onPress={item.onPress}>
            <Text style={H4}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </DefaultScreenWidget>
  );
}
