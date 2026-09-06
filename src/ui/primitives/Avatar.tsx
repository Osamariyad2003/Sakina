import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../theme';
import { AppText } from './AppText';

interface AvatarProps {
  uri?: string | null;
  initials?: string;
  size?: number;
}

export function Avatar({ uri, initials = '', size = 40 }: AvatarProps) {
  const theme = useTheme();
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={dimension} contentFit="cover" transition={150} />;
  }

  return (
    <View
      style={[
        dimension,
        { backgroundColor: theme.colors.brand.accentSoft, alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      <AppText variant="label" color={theme.colors.text.onBrand}>
        {initials.slice(0, 2).toUpperCase()}
      </AppText>
    </View>
  );
}
