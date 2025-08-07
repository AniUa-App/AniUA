import React, {useState, useEffect, useRef} from 'react';
import {View, StatusBar, StyleSheet, Animated, Image, Text} from 'react-native';
import {
  AppColor,
  appColor,
  black,
  Black_1,
  loaderColor,
  White,
} from '../Styles/Colors';
import {H2, H3, H4, H5} from '../Styles/Fonts';
import FastImage from 'react-native-fast-image';
import MainConfig from '../cfgs/MainConfig';
import Config from 'react-native-config';

export default function Loader() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const [imageLoaded, setImageLoaded] = useState(false);

  // Отримуємо версію додатку з безпечною перевіркою
  const appVersion = MainConfig.devInfo.version || '1.0.0';
  const gitHash = MainConfig.devInfo.gitShortHash || 'unknown';

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {!imageLoaded && <View style={[styles.logo]} />}

      <FastImage
        source={require('../../assets/AniUA-Logo.png')}
        style={[
          styles.logo,
          !imageLoaded && {position: 'absolute'},
          {marginTop: 30},
        ]}
        onLoadEnd={() => setImageLoaded(true)}
      />
      {/* Версія додатку внизу екрану */}
      <Animated.View
        style={[
          styles.versionContainer,
          {
            opacity: fadeAnim,
            transform: [{translateY: translateYAnim}],
          },
        ]}>
        <Text style={[H4, {color: White(1)}]}>
          {`${appVersion || '1.0.0'}-${gitHash || 'unknown'}`}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  versionText: {
    color: appColor,
    fontSize: 14,
    opacity: 0.8,
  },
});
