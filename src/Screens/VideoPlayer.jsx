import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {H3} from '../Styles/Fonts';
import {Black} from '../Styles/Colors';
import {useNavigation} from '@react-navigation/native';
import {AdBlockScript} from '../WebScripts/AdBlock';
import {useEffect} from 'react';
import Orientation from 'react-native-orientation-locker';
import {BackHandler} from 'react-native';

export default function VideoPlayerScreen({route}) {
  const {videoUrl, title} = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    const onBackPress = () => {
      console.log('onBackPress');
      navigation.goBack();
      StatusBar.setHidden(false);
      Orientation.lockToPortrait();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    StatusBar.setHidden(true);
    Orientation.unlockAllOrientations();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      <WebView
        source={{uri: videoUrl}}
        style={styles.video}
        injectedJavaScript={AdBlockScript}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black(1),
  },
  video: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: Black(0.7),
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
  },
  title: {
    color: 'white',
    marginLeft: 10,
    maxWidth: '80%',
  },
});
