import React from 'react';
import SegmentedControl, {
  NativeSegmentedControlIOSChangeEvent,
} from '@react-native-segmented-control/segmented-control';
import { NativeSyntheticEvent } from 'react-native';
import { useThemeColors } from '../Global/useTheme';
import { useThemedTextStyles } from '../Styles/Fonts';

interface SegmentedTabBarProps {
  values: string[];
  selectedIndex: number;
  onValueChange: (index: number) => void;
}

const SegmentedTabBarComponent: React.FC<SegmentedTabBarProps> = ({
  values,
  selectedIndex,
  onValueChange,
}) => {
  const themeColors = useThemeColors();
  const textStyles = useThemedTextStyles();

  const handleValueChange = (
    event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>,
  ) => {
    onValueChange(event.nativeEvent.selectedSegmentIndex);
  };

  return (
    <SegmentedControl
      values={values}
      selectedIndex={selectedIndex}
      onChange={handleValueChange}
      tintColor={themeColors.primary}
      backgroundColor={themeColors.subtle}
      fontStyle={{
        ...textStyles.H6,
        color: themeColors.text,
      }}
      activeFontStyle={{
        ...textStyles.H6,
        color: themeColors.accent,
      }}
      style={{
        height: 36,
      }}
    />
  );
};

export default SegmentedTabBarComponent;