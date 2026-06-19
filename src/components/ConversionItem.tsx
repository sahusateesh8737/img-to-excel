import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { IconButton } from './ui/IconButton';

interface ConversionItemProps {
  filename: string;
  date: string;
  size: string;
  onPress?: () => void;
  onShare?: () => void;
}

export const ConversionItem = ({ filename, date, size, onPress, onShare }: ConversionItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="table-view" size={24} color={theme.colors.primaryContainer} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.filename} numberOfLines={1} ellipsizeMode="tail">
          {filename}
        </Text>
        <Text style={styles.metadata} numberOfLines={1}>
          {date} • {size}
        </Text>
      </View>

      <IconButton 
        icon="share" 
        onPress={onShare} 
        color={theme.colors.onSurfaceVariant} 
        style={styles.shareButton}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.outlineVariant,
  },
  pressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.rounded.default,
    backgroundColor: 'rgba(33, 115, 70, 0.1)', // primaryContainer with 10% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    minWidth: 0, // Ensure text truncation works
  },
  filename: {
    fontFamily: theme.typography.bodyLg.fontFamily,
    fontSize: theme.typography.bodyLg.fontSize,
    fontWeight: theme.typography.bodyLg.fontWeight,
    color: theme.colors.onSurface,
  },
  metadata: {
    fontFamily: theme.typography.bodySm.fontFamily,
    fontSize: theme.typography.bodySm.fontSize,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  shareButton: {
    marginLeft: theme.spacing.xs,
  },
});
