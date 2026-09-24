import React from 'react';
import { Linking, Pressable, View, type ViewStyle } from 'react-native';
import { Image, type ImageContentFit } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { AppText } from './AppText';

/**
 * Curated content image attached to a backend entity (wellness exercise,
 * resource, community group). Mirrors the `image*` columns 1:1 — see the
 * `ImageSource` enum in the backend Prisma schema.
 */
export interface ContentImageData {
  url?: string | null;
  thumbUrl?: string | null;
  /** BlurHash string shown while the full image loads. */
  blurHash?: string | null;
  altAr?: string | null;
  altEn?: string | null;
  source?: 'unsplash' | 'upload' | null;
  authorName?: string | null;
  authorUrl?: string | null;
}

/** At or below this rendered height, the thumbnail is sharp enough. */
const THUMB_MAX_HEIGHT = 160;

/**
 * Picks the uri to render for a `ContentImage`-shaped object — for the places
 * that take a plain uri rather than the whole object (`Avatar`, share sheets).
 * Falls back to the full-size url when no thumbnail was stored.
 */
export function resolveImageUri(image?: ContentImageData | null, thumb = false): string | undefined {
  return (thumb ? image?.thumbUrl ?? image?.url : image?.url) ?? undefined;
}

interface ContentImageProps {
  image?: ContentImageData | null;
  height: number;
  /** Defaults to filling the parent — set a number for fixed-size thumbnails. */
  width?: number | '100%';
  /**
   * Force the smaller `thumbUrl` (or the full `url`). Left unset, the source
   * follows `height`: anything at or under `THUMB_MAX_HEIGHT` takes the
   * thumbnail, so a list row doesn't pull a 1080px photo for a 64pt slot.
   */
  thumb?: boolean;
  contentFit?: ImageContentFit;
  radiusKey?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  /**
   * Render the photographer credit under the image. Unsplash's API terms
   * require visible attribution, so this defaults on for that source and
   * should only be turned off where the credit is shown elsewhere on screen.
   */
  showCredit?: boolean;
  style?: ViewStyle;
}

/**
 * Renders a content image with a themed placeholder, a blurhash transition
 * and locale-matched alt text — and degrades to a plain themed block when the
 * entity has no image, so a missing or failed image never leaves a hole in
 * the layout.
 *
 * Deliberately dumb: it never fetches or picks an image. Images are curated
 * admin-side and arrive on the entity; the app never talks to an image
 * provider directly.
 */
export function ContentImage({
  image,
  height,
  width = '100%',
  thumb,
  contentFit = 'cover',
  radiusKey = 'lg',
  showCredit,
  style,
}: ContentImageProps) {
  const theme = useTheme();
  const { i18n, t } = useTranslation();

  const borderRadius = theme.radius[radiusKey];
  const useThumb = thumb ?? height <= THUMB_MAX_HEIGHT;
  const uri = (useThumb ? image?.thumbUrl ?? image?.url : image?.url) ?? null;

  const placeholderStyle: ViewStyle = {
    height,
    width,
    borderRadius,
    backgroundColor: theme.colors.brand.accentSoft,
    overflow: 'hidden',
  };

  if (!uri) {
    return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[placeholderStyle, style]} />;
  }

  const alt = (i18n.language.startsWith('ar') ? image?.altAr : image?.altEn) ?? undefined;
  // Not on thumbnails: a credit line under a 64pt tile squeezes the row's own
  // text. Unsplash attribution still shows everywhere the photo is displayed
  // at size (heroes, detail screens).
  const credit = showCredit ?? (!useThumb && image?.source === 'unsplash');

  return (
    <View style={style}>
      <Image
        source={{ uri }}
        // The themed fill shows while the photo loads (and if it never does),
        // so a slow card reads as a calm block rather than a hole. The
        // blurhash, when present, paints over it.
        style={{ height, width, borderRadius, backgroundColor: theme.colors.brand.accentSoft }}
        contentFit={contentFit}
        transition={200}
        // Images are remote and stable per entity — keep them across launches
        // so a scroll back up doesn't re-download on mobile data.
        cachePolicy="memory-disk"
        placeholder={image?.blurHash ? { blurhash: image.blurHash } : undefined}
        placeholderContentFit="cover"
        accessible={Boolean(alt)}
        accessibilityRole="image"
        accessibilityLabel={alt}
      />
      {credit && image?.authorName ? (
        <Pressable
          disabled={!image.authorUrl}
          accessibilityRole={image.authorUrl ? 'link' : undefined}
          onPress={image.authorUrl ? () => void Linking.openURL(image.authorUrl!) : undefined}
          style={{ paddingTop: theme.spacing.xxs }}
        >
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('common.photoCredit', { name: image.authorName })}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
