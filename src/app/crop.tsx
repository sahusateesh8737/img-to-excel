import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, PanResponder, Animated, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImageManipulator from 'expo-image-manipulator';
import { theme } from '../theme/theme';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';

// Fallback image for testing if none is provided
const FALLBACK_URI = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsB5B2_L3Z9xaW6zkEOx5z2A0ryTJxLO3samER9RcUywuSEXAPgtosxaGQv3Msa8SZdhj4bSmxS2qWnBERll3fhzuLDx7u-fM5rTkiTxOHof5iXfJP7Vd8dBCJXFbDkaGWM0ZYnkmwUMs1coQizi7Ox3bACY1iZpjFrki-z7liezH3dVxe4z9KX-M8Js4goSnRKzNZZx5LEdjWhTaTiMWc9WHNycPXhjWoXpZJE_K4NOB0njjWrxuc';

export default function CropScreen() {
  const router = useRouter();
  const { uri: selectedUri } = useLocalSearchParams<{ uri: string }>();
  const uri = selectedUri || FALLBACK_URI;
  
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  // State for image dimensions
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // State for crop box (values relative to rendered image)
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    // Attempt to get size via Image.getSize (works well for remote URLs)
    Image.getSize(uri, (width, height) => {
      setOriginalSize({ width, height });
    }, () => {
      // Silently fail, onLoad will act as a fallback
    });
  }, [uri]);

  // Calculate rendered image dimensions and position
  let renderedWidth = 0;
  let renderedHeight = 0;
  let offsetX = 0;
  let offsetY = 0;
  let scale = 1;

  if (originalSize.width > 0 && containerSize.width > 0) {
    scale = Math.min(
      containerSize.width / originalSize.width,
      containerSize.height / originalSize.height
    );
    renderedWidth = originalSize.width * scale;
    renderedHeight = originalSize.height * scale;
    offsetX = (containerSize.width - renderedWidth) / 2;
    offsetY = (containerSize.height - renderedHeight) / 2;
  }

  // Initialize crop box to be slightly smaller than the image
  useEffect(() => {
    if (renderedWidth > 0 && cropBox.width === 0) {
      setCropBox({
        x: renderedWidth * 0.1,
        y: renderedHeight * 0.1,
        width: renderedWidth * 0.8,
        height: renderedHeight * 0.8,
      });
    }
  }, [renderedWidth]);

  // --- Pan Responders for dragging corners ---
  // Using simple refs to track current drag values safely
  const currentCrop = useRef(cropBox);
  currentCrop.current = cropBox;

  const createPanResponder = (corner: 'tl' | 'tr' | 'bl' | 'br') => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const minSize = 50;
        let newX = currentCrop.current.x;
        let newY = currentCrop.current.y;
        let newW = currentCrop.current.width;
        let newH = currentCrop.current.height;

        if (corner === 'tl') {
          newX = Math.max(0, Math.min(newX + gestureState.dx, newX + newW - minSize));
          newY = Math.max(0, Math.min(newY + gestureState.dy, newY + newH - minSize));
          newW = currentCrop.current.x + currentCrop.current.width - newX;
          newH = currentCrop.current.y + currentCrop.current.height - newY;
        } else if (corner === 'tr') {
          newW = Math.max(minSize, Math.min(newW + gestureState.dx, renderedWidth - newX));
          newY = Math.max(0, Math.min(newY + gestureState.dy, newY + newH - minSize));
          newH = currentCrop.current.y + currentCrop.current.height - newY;
        } else if (corner === 'bl') {
          newX = Math.max(0, Math.min(newX + gestureState.dx, newX + newW - minSize));
          newW = currentCrop.current.x + currentCrop.current.width - newX;
          newH = Math.max(minSize, Math.min(newH + gestureState.dy, renderedHeight - newY));
        } else if (corner === 'br') {
          newW = Math.max(minSize, Math.min(newW + gestureState.dx, renderedWidth - newX));
          newH = Math.max(minSize, Math.min(newH + gestureState.dy, renderedHeight - newY));
        }

        setCropBox({ x: newX, y: newY, width: newW, height: newH });
      },
      onPanResponderRelease: () => {
        // Reset gesture state tracking if needed
      }
    });
  };

  const tlResponder = useRef(createPanResponder('tl')).current;
  const trResponder = useRef(createPanResponder('tr')).current;
  const blResponder = useRef(createPanResponder('bl')).current;
  const brResponder = useRef(createPanResponder('br')).current;

  // --- Handlers ---
  const handleCancel = () => {
    router.back();
  };

  const handleConfirm = async () => {
    if (!originalSize.width || !renderedWidth) return;
    
    try {
      // 1. Calculate actual crop coordinates based on original image resolution
      let actualX = Math.floor((cropBox.x / renderedWidth) * originalSize.width);
      let actualY = Math.floor((cropBox.y / renderedHeight) * originalSize.height);
      let actualW = Math.floor((cropBox.width / renderedWidth) * originalSize.width);
      let actualH = Math.floor((cropBox.height / renderedHeight) * originalSize.height);

      // Ensure coordinates are integers and strictly within image bounds
      actualX = Math.max(0, actualX);
      actualY = Math.max(0, actualY);
      actualW = Math.min(actualW, Math.floor(originalSize.width) - actualX);
      actualH = Math.min(actualH, Math.floor(originalSize.height) - actualY);

      // 2. Perform the crop
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX: actualX, originY: actualY, width: actualW, height: actualH } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 3. Navigate to converting screen with the NEW cropped URI
      router.replace({ pathname: '/converting', params: { uri: manipResult.uri } });
    } catch (error) {
      console.error("Crop error:", error);
      Alert.alert("Error", "Failed to crop image.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <IconButton icon="arrow-back" onPress={handleCancel} />
        <Text style={styles.headerTitle}>Crop Image</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mainArea}>
        <View 
          style={styles.imageContainer}
          onLayout={(e) => setContainerSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        >
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="contain"
            onLoad={(e: any) => {
              // React Native Native vs Web event handling
              const source = e.nativeEvent.source;
              if (source && source.width) {
                setOriginalSize({ width: source.width, height: source.height });
              } else if (e.nativeEvent.width) {
                setOriginalSize({ width: e.nativeEvent.width, height: e.nativeEvent.height });
              } else if (e.target && e.target.naturalWidth) {
                setOriginalSize({ width: e.target.naturalWidth, height: e.target.naturalHeight });
              }
            }}
          />
          
          {/* Interactive Crop Overlay Wrapper (positioned exactly over the rendered image pixels) */}
          {renderedWidth > 0 && (
            <View style={[
              styles.overlayWrapper,
              { left: offsetX, top: offsetY, width: renderedWidth, height: renderedHeight, zIndex: 10 }
            ]}>
              
              {/* Dimmed Background Sections */}
              <View style={[styles.dimmed, { top: 0, left: 0, right: 0, height: cropBox.y }]} />
              <View style={[styles.dimmed, { top: cropBox.y + cropBox.height, left: 0, right: 0, bottom: 0 }]} />
              <View style={[styles.dimmed, { top: cropBox.y, left: 0, width: cropBox.x, height: cropBox.height }]} />
              <View style={[styles.dimmed, { top: cropBox.y, left: cropBox.x + cropBox.width, right: 0, height: cropBox.height }]} />

              {/* The Crop Box */}
              <View style={[
                styles.cropArea, 
                { left: cropBox.x, top: cropBox.y, width: cropBox.width, height: cropBox.height }
              ]}>
                <View style={[styles.gridLine, { width: '100%', height: 1, top: '33.33%' }]} />
                <View style={[styles.gridLine, { width: '100%', height: 1, top: '66.66%' }]} />
                <View style={[styles.gridLine, { height: '100%', width: 1, left: '33.33%' }]} />
                <View style={[styles.gridLine, { height: '100%', width: 1, left: '66.66%' }]} />
                
                {/* Drag Handles */}
                <View style={[styles.cropHandle, styles.handleTL]} {...tlResponder.panHandlers} />
                <View style={[styles.cropHandle, styles.handleTR]} {...trResponder.panHandlers} />
                <View style={[styles.cropHandle, styles.handleBL]} {...blResponder.panHandlers} />
                <View style={[styles.cropHandle, styles.handleBR]} {...brResponder.panHandlers} />
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
        <Button
          title="Cancel"
          variant="ghost"
          onPress={handleCancel}
          style={styles.footerButton}
        />
        <Button
          title="Confirm Crop"
          variant="primary"
          icon="check"
          onPress={handleConfirm}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    height: 48 + 44, 
    backgroundColor: theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.outlineVariant,
  },
  headerTitle: {
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    fontWeight: theme.typography.headlineMd.fontWeight,
    color: theme.colors.primary,
  },
  mainArea: {
    flex: 1,
    backgroundColor: theme.colors.inverseSurface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  imageContainer: {
    width: '100%',
    maxWidth: 512,
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.rounded.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayWrapper: {
    position: 'absolute',
    overflow: 'hidden',
  },
  dimmed: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cropArea: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: theme.colors.primaryContainer,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  cropHandle: {
    position: 'absolute',
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: theme.colors.primaryContainer,
    borderRadius: 16,
    ...theme.shadows.level1,
  },
  handleTL: { top: -16, left: -16 },
  handleTR: { top: -16, right: -16 },
  handleBL: { bottom: -16, left: -16 },
  handleBR: { bottom: -16, right: -16 },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outlineVariant,
  },
  footerButton: {
    flex: 1,
    minHeight: 48,
  },
});
