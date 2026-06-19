import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, useWindowDimensions, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme/theme';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { ConversionItem } from '../../components/ConversionItem';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  const [recentConversions, setRecentConversions] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        try {
          const historyStr = await AsyncStorage.getItem('conversion_history');
          if (historyStr) {
            setRecentConversions(JSON.parse(historyStr));
          }
        } catch (e) {
          console.error("Failed to load history", e);
        }
      };
      loadHistory();
    }, [])
  );

  const handleShare = async (item: any) => {
    if (Platform.OS === 'web') {
      const a = document.createElement('a');
      a.href = item.dataUri;
      a.download = `extracted_data_${item.id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(item.path);
      } else {
        alert("Sharing not available");
      }
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Camera permission is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      router.push({ pathname: '/crop', params: { uri: result.assets[0].uri } });
    }
  };

  const handleUploadGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Gallery permission is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      router.push({ pathname: '/crop', params: { uri: result.assets[0].uri } });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header (Hidden on tablet/desktop as per design, but keeping simple here) */}
      {!isTablet && (
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
            <Text style={styles.headerTitle}>ImgToExcel</Text>
          </View>
          <IconButton icon="more-vert" onPress={() => {}} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentMaxWidth}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroImageContainer}>
              <ImageBackground
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaPB9qE1ZfbUO7zexmwmcEvSzLaRuUYzUCy2GGdS0GZVApGOWegQf2PUYAJy5FRYr6ePeO0NzMyiEpYtPZAJPKjBQiNJNP_ZolM-P-L6TbFKHj2dRMw56FYzN0ndo5nA1v_kQD_Cr16ofPsFKWjGRj_vchh0zXMwjPRAZZR2eLLA5jvldwtP-6aHY_fhRV9IvwqSRvZd14QBs4y0DWlVHMs6ENDVH_89-cfaIH94D2BTr98clFZm9b' }}
                style={styles.heroImage}
                imageStyle={{ opacity: 0.8 }}
              >
                <View style={styles.heroIconWrapper}>
                  <MaterialIcons name="document-scanner" size={48} color={theme.colors.primaryContainer} />
                </View>
              </ImageBackground>
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Convert to Excel</Text>
              <Text style={styles.heroSubtitle}>Instantly digitize your printed tables and lists.</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={[styles.actionSection, isTablet && styles.actionSectionTablet]}>
            <View style={styles.actionButtonWrapper}>
              <Button
                title="Take a Photo"
                icon="photo-camera"
                variant="primary"
                onPress={handleTakePhoto}
                style={styles.actionButton}
              />
            </View>
            <View style={styles.actionButtonWrapper}>
              <Button
                title="Upload from Gallery"
                icon="image"
                variant="secondary"
                onPress={handleUploadGallery}
                style={styles.actionButton}
              />
            </View>
          </View>

          {/* Recent Conversions */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Conversions</Text>
              {recentConversions.length > 0 && <Text style={styles.recentViewAll}>View All</Text>}
            </View>
            <View style={styles.recentList}>
              {recentConversions.length === 0 ? (
                <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, padding: theme.spacing.lg }}>
                  No recent conversions yet.
                </Text>
              ) : (
                recentConversions.map((item) => (
                  <ConversionItem
                    key={item.id}
                    filename={item.name}
                    date={item.date}
                    size={item.size}
                    onPress={() => handleShare(item)}
                    onShare={() => handleShare(item)}
                  />
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    height: 48,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.outlineVariant,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    fontWeight: theme.typography.headlineMd.fontWeight,
    color: theme.colors.primary,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  contentMaxWidth: {
    width: '100%',
    maxWidth: 896, // max-w-4xl roughly
    gap: theme.spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  heroImageContainer: {
    width: '100%',
    height: 256,
    borderRadius: theme.rounded.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: theme.rounded.default,
    ...theme.shadows.level1,
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: theme.typography.headlineLgMobile.fontFamily,
    fontSize: theme.typography.headlineLgMobile.fontSize,
    fontWeight: theme.typography.headlineLgMobile.fontWeight,
    color: theme.colors.primaryContainer,
  },
  heroSubtitle: {
    fontFamily: theme.typography.bodyLg.fontFamily,
    fontSize: theme.typography.bodyLg.fontSize,
    color: theme.colors.onSurfaceVariant,
    marginTop: theme.spacing.xs,
  },
  actionSection: {
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
  actionSectionTablet: {
    flexDirection: 'row',
  },
  actionButtonWrapper: {
    flex: 1,
  },
  actionButton: {
    height: 120,
  },
  recentSection: {
    gap: theme.spacing.sm,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentTitle: {
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    fontWeight: theme.typography.headlineMd.fontWeight,
    color: theme.colors.onSurface,
  },
  recentViewAll: {
    fontFamily: theme.typography.bodySm.fontFamily,
    fontSize: theme.typography.bodySm.fontSize,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  recentList: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.rounded.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
});
