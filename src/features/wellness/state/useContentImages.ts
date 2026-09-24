import { useQuery } from '@tanstack/react-query';
import {
  contentImageService,
  type ContentImageTarget,
} from '../services/contentImageService';
import type { ContentImage } from '../../../types/models';

export const contentImageQueryKeys = {
  all: ['contentImages'] as const,
};

/**
 * Imagery for the app's code-owned content. Served from one cached request, so
 * every card and screen can ask for its own image without a request each.
 */
export function useContentImagesQuery() {
  return useQuery({
    queryKey: contentImageQueryKeys.all,
    queryFn: () => contentImageService.list(),
    // Photos change rarely and never urgently.
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * The curated image for one article/exercise id, or undefined while it loads,
 * when none was curated, or when the request failed. Callers fall back to
 * whatever their content file carries.
 */
export function useContentImage(target: ContentImageTarget, contentKey: string): ContentImage | undefined {
  const { data } = useContentImagesQuery();
  return data?.[target]?.[contentKey];
}
