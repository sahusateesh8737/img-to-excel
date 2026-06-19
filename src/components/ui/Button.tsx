import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  onPress?: () => void;
  title: string;
  variant?: ButtonVariant;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button = ({ onPress, title, variant = 'primary', icon, style, textStyle, disabled }: ButtonProps) => {
  const getContainerStyle = (pressed: boolean) => {
    let baseStyle: ViewStyle = { ...styles.container };
    
    if (variant === 'primary') {
      baseStyle = { ...baseStyle, ...styles.primaryContainer };
    } else if (variant === 'secondary') {
      baseStyle = { ...baseStyle, ...styles.secondaryContainer };
    } else if (variant === 'ghost') {
      baseStyle = { ...baseStyle, ...styles.ghostContainer };
    }

    if (pressed && !disabled) {
      if (variant === 'primary') baseStyle.backgroundColor = theme.colors.surfaceTint;
      if (variant === 'secondary') baseStyle.backgroundColor = theme.colors.surfaceContainerLow;
      if (variant === 'ghost') baseStyle.backgroundColor = theme.colors.surfaceContainerLow;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return [baseStyle, style, pressed && !disabled ? styles.pressed : null];
  };

  const getTextStyle = () => {
    let baseStyle: TextStyle = { ...styles.text };
    
    if (variant === 'primary') {
      baseStyle = { ...baseStyle, color: theme.colors.onPrimary };
    } else if (variant === 'secondary') {
      baseStyle = { ...baseStyle, color: theme.colors.primaryContainer };
    } else if (variant === 'ghost') {
      baseStyle = { ...baseStyle, color: theme.colors.primary };
    }

    return [baseStyle, textStyle];
  };

  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => getContainerStyle(pressed)}>
      {icon && (
        <MaterialIcons 
          name={icon} 
          size={32} 
          color={variant === 'primary' ? theme.colors.onPrimary : theme.colors.primaryContainer} 
          style={styles.icon} 
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.rounded.md,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
  },
  primaryContainer: {
    backgroundColor: theme.colors.primaryContainer,
    ...theme.shadows.level1,
  },
  secondaryContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: theme.colors.primaryContainer,
    ...theme.shadows.level1,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.sm,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    fontWeight: theme.typography.headlineMd.fontWeight,
    lineHeight: theme.typography.headlineMd.lineHeight,
  },
  icon: {
    marginBottom: theme.spacing.xs,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
