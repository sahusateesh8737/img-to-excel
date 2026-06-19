import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

interface IconButtonProps {
  onPress?: () => void;
  icon: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
  style?: ViewStyle;
  backgroundColor?: string;
}

export const IconButton = ({ onPress, icon, size = 24, color = theme.colors.onSurfaceVariant, style, backgroundColor }: IconButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        backgroundColor ? { backgroundColor } : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <MaterialIcons name={icon} size={size} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xs,
    borderRadius: theme.rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    transform: [{ scale: 0.95 }],
  },
});
