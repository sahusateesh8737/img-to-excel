import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';

export default function ConvertingScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const insets = useSafeAreaInsets();
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 0.95,
      duration: 10000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Start upload
    if (uri) {
      uploadAndProcessImage(uri);
    } else {
      setErrorMsg("No image provided");
    }

  }, [uri]);

  const uploadAndProcessImage = async (imageUri: string) => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 
        (Platform.OS === 'web' 
          ? 'http://127.0.0.1:3001/api/convert' 
          : 'http://10.199.151.234:3001/api/convert');

      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        // On web, FormData expects a true Blob or File object
        const fetchResponse = await fetch(imageUri);
        const blob = await fetchResponse.blob();
        formData.append('image', blob, 'upload.jpg');
      } else {
        // On iOS/Android, React Native extends FormData to accept this object format
        // @ts-ignore
        formData.append('image', {
          uri: imageUri,
          name: 'upload.jpg',
          type: 'image/jpeg',
        });
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      // Max out progress bar to 100%
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();

      if (Platform.OS === 'web') {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const dataUri = reader.result as string;
            const base64data = dataUri.split(',')[1];
            const timestamp = Date.now();
            
            // Save to AsyncStorage
            const newHistoryItem = {
              id: timestamp.toString(),
              name: `Web Extraction ${new Date(timestamp).toLocaleDateString()}`,
              date: new Date(timestamp).toLocaleDateString(),
              size: `${Math.round(base64data.length / 1024)} KB`,
              dataUri: dataUri
            };

            const existingHistoryStr = await AsyncStorage.getItem('conversion_history');
            const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
            await AsyncStorage.setItem('conversion_history', JSON.stringify([newHistoryItem, ...existingHistory]));

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `extracted_data_${timestamp}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            router.dismissAll();
          } catch (e) {
            setErrorMsg("Failed to save history.");
          }
        };
        reader.readAsDataURL(blob);
      } else {
        // Read blob as base64 and save locally
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64data = (reader.result as string).split(',')[1];
            const timestamp = Date.now();
            const fileName = `extracted_data_${timestamp}.xlsx`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            
            await FileSystem.writeAsStringAsync(fileUri, base64data, {
              encoding: FileSystem.EncodingType.Base64,
            });

            // Save to AsyncStorage
            const newHistoryItem = {
              id: timestamp.toString(),
              name: `Extraction ${new Date(timestamp).toLocaleDateString()}`,
              date: new Date(timestamp).toLocaleDateString(),
              size: `${Math.round(base64data.length / 1024)} KB`,
              path: fileUri
            };

            const existingHistoryStr = await AsyncStorage.getItem('conversion_history');
            const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
            await AsyncStorage.setItem('conversion_history', JSON.stringify([newHistoryItem, ...existingHistory]));

            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri);
            } else {
              Alert.alert("Success", "File saved to documents!");
            }
            router.dismissAll();
          } catch (e) {
            setErrorMsg("Failed to save Excel file.");
          }
        };
        reader.readAsDataURL(blob);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to convert image.");
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, theme.spacing.xl) }]}>
      <View style={styles.content}>
        {errorMsg ? (
          <View style={styles.textContainer}>
            <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
            <Text style={[styles.title, { color: theme.colors.error }]}>Processing Failed</Text>
            <Text style={styles.subtitle}>{errorMsg}</Text>
          </View>
        ) : (
          <>
            <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>AI is processing your image...</Text>
              <Animated.Text style={[styles.subtitle, { opacity: pulseAnim }]}>
                Converting table to Excel format (5-15s)
              </Animated.Text>
            </View>
            <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
            </View>
          </>
        )}
      </View>

      {!errorMsg && (
        <View style={styles.tipContainer}>
          <View style={styles.tipCard}>
            <MaterialIcons name="lightbulb" size={20} color={theme.colors.primary} />
            <Text style={styles.tipText}>
              Tip: The clearer the table, the better the results.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 448,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    gap: theme.spacing.lg,
  },
  spinnerContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'rgba(33, 115, 70, 0.2)',
    borderLeftColor: theme.colors.primaryContainer,
  },
  textContainer: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    fontWeight: theme.typography.headlineMd.fontWeight,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.bodyLg.fontFamily,
    fontSize: theme.typography.bodyLg.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: theme.rounded.full,
    overflow: 'hidden',
    marginTop: theme.spacing.xl,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.rounded.full,
  },
  tipContainer: {
    position: 'absolute',
    bottom: theme.spacing.xl * 2,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.rounded.default,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.outlineVariant,
    ...theme.shadows.level1,
    gap: theme.spacing.sm,
  },
  tipText: {
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: theme.typography.labelMd.fontSize,
    fontWeight: theme.typography.labelMd.fontWeight,
    color: theme.colors.onSurfaceVariant,
  },
});
