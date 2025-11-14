import { useEffect, useState } from 'react';
import { getPublicSEOData } from '../services/publicindex';

export const useSEO = (pageName) => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const data = await getPublicSEOData(pageName);
        if (data && data.seo) {
          setSeoData(data.seo);
        }
      } catch (error) {
        console.error(`Error loading SEO for ${pageName}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (pageName) {
      fetchSEO();
    }
  }, [pageName]);

  return { seoData, loading };
};
