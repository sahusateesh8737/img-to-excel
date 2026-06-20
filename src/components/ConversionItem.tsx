import React from 'react';
import { List, IconButton } from 'react-native-paper';
import { theme } from '../theme/theme';

interface ConversionItemProps {
  filename: string;
  date: string;
  size: string;
  onPress?: () => void;
  onShare?: () => void;
}

export const ConversionItem = ({ filename, date, size, onPress, onShare }: ConversionItemProps) => {
  return (
    <List.Item
      title={filename}
      description={`${date} • ${size}`}
      onPress={onPress}
      left={props => <List.Icon {...props} icon="file-table" color={theme.colors.primary} />}
      right={props => (
        <IconButton 
          {...props} 
          icon="share" 
          onPress={onShare} 
          iconColor={theme.colors.onSurfaceVariant} 
        />
      )}
      style={{ 
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
      }}
      titleStyle={{ 
        fontFamily: theme.typography.bodyLg.fontFamily,
        fontSize: theme.typography.bodyLg.fontSize,
        fontWeight: theme.typography.bodyLg.fontWeight,
        color: theme.colors.onSurface
      }}
      descriptionStyle={{
        fontFamily: theme.typography.bodySm.fontFamily,
        fontSize: theme.typography.bodySm.fontSize,
        color: theme.colors.onSurfaceVariant
      }}
    />
  );
};
