// Web shim for react-native-linear-gradient — uses CSS linear-gradient
import React from 'react';
import { View } from 'react-native';

function LinearGradient({ colors = [], start, end, locations, style, children, ...props }) {
  const cssColors = colors.length > 0 ? colors : ['transparent', 'transparent'];

  let direction = 'to bottom';
  if (start && end) {
    if (start.x === 0 && start.y === 0 && end.x === 1 && end.y === 0) {
      direction = 'to right';
    } else if (start.x === 1 && start.y === 0 && end.x === 0 && end.y === 0) {
      direction = 'to left';
    } else if (start.x === 0 && start.y === 1 && end.x === 0 && end.y === 0) {
      direction = 'to top';
    } else if (start.x === 0 && start.y === 0 && end.x === 1 && end.y === 1) {
      direction = 'to bottom right';
    }
  }

  let colorStops;
  if (locations && locations.length === cssColors.length) {
    colorStops = cssColors.map((c, i) => `${c} ${locations[i] * 100}%`).join(', ');
  } else {
    colorStops = cssColors.join(', ');
  }

  return (
    <View
      {...props}
      style={[
        style,
        { backgroundImage: `linear-gradient(${direction}, ${colorStops})` },
      ]}
    >
      {children}
    </View>
  );
}

export default LinearGradient;
