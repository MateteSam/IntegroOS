// Unified image API client for Unsplash and Pexels
export type ImageAsset = {
  id: string;
  url: string;
  thumbnail: string;
  alt: string;
  photographer?: string;
  source: 'unsplash' | 'pexels';
};

// Unsplash API integration
export async function searchUnsplashImages(query: string, count: number = 9): Promise<ImageAsset[]> {
  try {
    const apiKey = localStorage.getItem('UNSPLASH_API_KEY');
    if (!apiKey) {
      return [];
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results.map((img: any) => ({
      id: img.id,
      url: img.urls.regular,
      thumbnail: img.urls.small,
      alt: img.alt_description || query,
      photographer: img.user.name,
      source: 'unsplash' as const,
    }));
  } catch (error) {
    console.error('Unsplash API error:', error);
    return [];
  }
}

// Pexels API integration
export async function searchPexelsImages(query: string, count: number = 9): Promise<ImageAsset[]> {
  try {
    const apiKey = localStorage.getItem('PEXELS_API_KEY');
    if (!apiKey) {
      return [];
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`,
      {
        headers: {
          'Authorization': apiKey,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.photos.map((img: any) => ({
      id: String(img.id),
      url: img.src.large,
      thumbnail: img.src.medium,
      alt: img.alt || query,
      photographer: img.photographer,
      source: 'pexels' as const,
    }));
  } catch (error) {
    console.error('Pexels API error:', error);
    return [];
  }
}


// Search both APIs and combine results
export async function searchImages(query: string, count: number = 18): Promise<ImageAsset[]> {
  const halfCount = Math.ceil(count / 2);

  const [unsplashImages, pexelsImages] = await Promise.all([
    searchUnsplashImages(query, halfCount),
    searchPexelsImages(query, halfCount),
  ]);

  return [...unsplashImages, ...pexelsImages].slice(0, count);
}

// Save API keys
export function saveImageAPIKeys(unsplashKey: string, pexelsKey: string) {
  try {
    if (unsplashKey) localStorage.setItem('UNSPLASH_API_KEY', unsplashKey);
    if (pexelsKey) localStorage.setItem('PEXELS_API_KEY', pexelsKey);
  } catch (error) {
    console.error('Failed to save API keys:', error);
  }
}
