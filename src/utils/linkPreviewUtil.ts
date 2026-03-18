// src/utils/linkPreviewUtil.ts

// Extract URLs from text
export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

// Fetch metadata for a URL
export const fetchLinkPreview = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    // Extract Open Graph metadata
    const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
    const ogDescription = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
    const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);

    // Fallback to regular meta tags
    const metaDescription = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);

    return {
      url,
      title: ogTitle?.[1] || title,
      description: ogDescription?.[1] || metaDescription?.[1],
      image: ogImage?.[1],
    };
  } catch (error) {
    console.error('Failed to fetch link preview:', error);
    return {
      url,
      title: url,
      description: undefined,
      image: undefined,
    };
  }
};