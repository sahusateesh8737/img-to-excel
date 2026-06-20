import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text as PaperText, Button as PaperButton, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { theme } from '../theme/theme';

export default function ConvertingScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const insets = useSafeAreaInsets();
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<'converting' | 'success'>('converting');
  const [savedFileUri, setSavedFileUri] = useState<string | null>(null);

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

      const responseJson = await response.json();
      const base64data = responseJson.base64;
      const timestamp = Date.now();

      if (Platform.OS === 'web') {
        try {
          const dataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64data}`;
          
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

          // Convert base64 to blob for downloading on web
          const byteCharacters = atob(base64data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `extracted_data_${timestamp}.xlsx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setSavedFileUri(dataUri);
          setStatus('success');
        } catch (e) {
          console.error("Web save error:", e);
          setErrorMsg("Failed to save history.");
        }
      } else {
        // Save locally for mobile
        try {
          const fileName = `extracted_data_${timestamp}.xlsx`;
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: 'base64' as any,
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

          setSavedFileUri(fileUri);
          setStatus('success');
        } catch (e) {
          console.error("Mobile save error:", e);
          setErrorMsg(`Failed to save Excel file. ${e}`);
        }
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
            <PaperText variant="headlineMedium" style={{ color: theme.colors.error }}>Processing Failed</PaperText>
            <PaperText variant="bodyLarge" style={styles.subtitle}>{errorMsg}</PaperText>
          </View>
        ) : status === 'success' ? (
          <View style={styles.textContainer}>
            <MaterialIcons name="check-circle" size={64} color={theme.colors.primary} />
            <PaperText variant="headlineMedium" style={{ color: theme.colors.primary, textAlign: 'center' }}>Conversion Complete!</PaperText>
            <PaperText variant="bodyLarge" style={styles.subtitle}>Your Excel file is ready.</PaperText>
            
            <View style={styles.actionsContainer}>
              <PaperButton 
                mode="contained"
                icon="table"
                onPress={async () => {
                  if (Platform.OS === 'web') {
                    Alert.alert("Already Downloaded", "The file was already downloaded to your browser.");
                  } else if (savedFileUri) {
                    try {
                      if (Platform.OS === 'android') {
                        const contentUri = await FileSystem.getContentUriAsync(savedFileUri);
                        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                          data: contentUri,
                          flags: 1,
                          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        });
                      } else {
                        if (await Sharing.isAvailableAsync()) {
                          await Sharing.shareAsync(savedFileUri, { 
                            UTI: 'com.microsoft.excel.xls', 
                            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                          });
                        }
                      }
                    } catch (e) {
                      Alert.alert("Notice", "No app found to open Excel files. Please install Google Sheets or Microsoft Excel.");
                    }
                  }
                }}
              >
                Open in Sheets / Excel
              </PaperButton>
              
              <PaperButton 
                mode="contained-tonal"
                icon="share"
                onPress={async () => {
                  if (Platform.OS === 'web') {
                    Alert.alert("Not supported", "Please use the Open button to download the file.");
                  } else if (savedFileUri) {
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(savedFileUri, { 
                        UTI: 'com.microsoft.excel.xls', 
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                      });
                    } else {
                      Alert.alert("Not available", "Sharing is not available on this device");
                    }
                  }
                }}
              >
                Share File
              </PaperButton>
              
              <PaperButton 
                mode="text"
                icon="home"
                onPress={() => router.dismissAll()}
              >
                Return to Home
              </PaperButton>
            </View>
          </View>
        ) : (
          <View style={{ width: '100%', alignItems: 'center', gap: theme.spacing.lg }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <View style={styles.textContainer}>
              <PaperText variant="headlineSmall" style={{ color: theme.colors.primary, textAlign: 'center' }}>AI is processing your image...</PaperText>
              <Animated.View style={{ opacity: pulseAnim }}>
                <PaperText variant="bodyLarge" style={styles.subtitle}>
                  Converting table to Excel format (5-15s)
                </PaperText>
              </Animated.View>
            </View>
            <View style={{ width: '100%' }}>
              <ProgressBar progress={0.5} indeterminate color={theme.colors.primary} />
            </View>
          </View>
        )}
      </View>

      {status === 'converting' && !errorMsg && (
        <View style={styles.tipContainer}>
          <View style={styles.tipCard}>
            <MaterialIcons name="lightbulb" size={20} color={theme.colors.primary} />
            <PaperText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Tip: The clearer the table, the better the results.
            </PaperText>
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
  actionsContainer: {
    width: '100%',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.rounded.full,
    gap: theme.spacing.sm,
    width: '100%',
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.labelLg.fontFamily,
    fontSize: theme.typography.labelLg.fontSize,
    fontWeight: theme.typography.labelLg.fontWeight,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.rounded.full,
    gap: theme.spacing.sm,
    width: '100%',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.labelLg.fontFamily,
    fontSize: theme.typography.labelLg.fontSize,
    fontWeight: theme.typography.labelLg.fontWeight,
  },
});
