import React, {useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, Dimensions} from 'react-native';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {TouchableOpacity} from '../Button';
import {Black, white, appColor, Gray} from '../../Styles/Colors';
import {H3, H4} from '../../Styles/Fonts';
import Icons from '../../Styles/Icons';

export default function SpeedBottomSheet({
  sheetRef,
  currentRate,
  onRateChange,
}) {
  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];
  const [orientation, setOrientation] = React.useState(getOrientation(Dimensions.get('window').width, Dimensions.get('window').height));


  const handleRateChange = (rate) => {
    onRateChange(rate);
    sheetRef.current?.close();
  };


  function getOrientation(width, height) {
    if (!width || !height) return 'vertical';
    return width > height ? 'horizontal' : 'vertical';
  }




  useEffect(() => {
    const handleChange = ({ window }) => {
      setOrientation(getOrientation(window.width, window.height));
      sheetRef.current?.close();
    };

    const subscription = Dimensions.addEventListener('change', handleChange);

    return () => {
      subscription?.remove?.();
    };
  }, [sheetRef]);


  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={orientation === 'horizontal' ? ['45%'] : ['20%']}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{backgroundColor: Black(0.95)}}
      handleIndicatorStyle={{backgroundColor: Gray(0.5)}}
      backdropComponent={props => (
        <TouchableOpacity
          onPress={() => sheetRef.current?.close()}
          activeOpacity={1}
          {...props}
        />
      )}
      animationDuration={300}
      enableContentPanningGesture={false}>
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={[H3, {color: white}]}>Швидкість відтворення</Text>
        
        </View>
        
        <View style={styles.flatListContainer}>
          <FlatList
            data={speedOptions}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.speedOptionsContainer}
            keyExtractor={(item) => item.toString()}
            decelerationRate="fast"
            snapToAlignment="center"
            renderItem={({item: speed, index}) => (
            <TouchableOpacity
              style={[
                styles.speedOption,
                currentRate === speed && styles.speedOptionActive,
                index !== speedOptions.length - 1 && {marginRight: 12},
              ]}
              onPress={() => handleRateChange(speed)}>
              <Text
                style={[
                  H4,
                  {
                    color: currentRate === speed ? appColor : white,
                    textAlign: 'center',
                  },
                ]}>
                {speed}x
              </Text>
              {currentRate === speed && (
                <View style={styles.checkIcon}>
                  <Icons.Check size={16} color={appColor} />
                </View>
              )}
            </TouchableOpacity>
          )}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 4,
    
  },

  speedOptionsContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  speedOption: {
    minWidth: 80,
    height: 60,
    borderRadius: 12,
    backgroundColor: Black(0.5),
    borderWidth: 1,
    borderColor: Gray(0.5),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  speedOptionActive: {
    backgroundColor: Black(0.8),
    borderWidth: 2,
    borderColor: appColor,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
}); 