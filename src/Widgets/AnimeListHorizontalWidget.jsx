import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {TouchableOpacity} from './Button';
import React from 'react';
import Icon from '../Styles/Icons';
import {appColor, black, white} from '../Styles/Colors';
import {H3} from '../Styles/Fonts';
import {GetScreenHeight, GetScreenWidth} from '../Global/Functions';
import {Image} from './LoadersWidgets';
import {useNavigation} from '@react-navigation/native';

export default function AnimeListHorizontal({
  animeList,
  title,
  onClickMore = null,
}) {
  const navigation = useNavigation();

  return (
    <View style={{flex: 1}}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.9}
        onPress={onClickMore}>
        <Text style={[styles.title, H3]}>{title}</Text>
        <View style={styles.arrowRightIcon}>
          {onClickMore && 
            <Icon.ArrowRight size={34} color={appColor} />
          }
        </View>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {animeList.map((anime, index) => (
          <TouchableOpacity
            key={index}
            style={[{marginHorizontal: 8}, styles.image]}
            onPress={() =>
              navigation.navigate('HiddenStack', {
                screen: 'AnimePreview',
                params: {anime},
              })
            }>
            <Image uri={anime.image} style={styles.image} />
            <Text style={[H3, {color: white}]} numberOfLines={2}>
              {anime.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: GetScreenWidth() * 0.4,
    height: GetScreenHeight() * 0.3,
    borderRadius: 8,
  },
  arrowRightIcon: {
    paddingRight: '5%',
    paddingTop: '5%',
  },
  header: {
    paddingHorizontal: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: black,
    width: '100%',
    paddingBottom: 5,
  },
  title: {
    paddingLeft: '5%',
    paddingTop: '5%',
    paddingBottom: '3%',
  },
});
