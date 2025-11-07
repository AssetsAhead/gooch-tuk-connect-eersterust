import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignedUrlConfig {
  bucketName: string;
  filePath: string;
  expirySeconds?: number;
}

export const useSignedUrlRefresh = (config: SignedUrlConfig | null) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expirySeconds = config?.expirySeconds || 3600; // Default 1 hour
  const refreshBeforeExpiry = 300; // Refresh 5 minutes before expiry

  const refreshUrl = useCallback(async () => {
    if (!config) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const { data, error: signedUrlError } = await supabase.storage
        .from(config.bucketName)
        .createSignedUrl(config.filePath, expirySeconds);

      if (signedUrlError) throw signedUrlError;

      setSignedUrl(data.signedUrl);
    } catch (err) {
      console.error('Error refreshing signed URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh URL');
    } finally {
      setIsRefreshing(false);
    }
  }, [config, expirySeconds]);

  useEffect(() => {
    if (!config) {
      setSignedUrl(null);
      return;
    }

    // Initial URL fetch
    refreshUrl();

    // Set up refresh timer - refresh 5 minutes before expiry
    const refreshInterval = (expirySeconds - refreshBeforeExpiry) * 1000;
    const intervalId = setInterval(refreshUrl, refreshInterval);

    return () => clearInterval(intervalId);
  }, [config, refreshUrl, expirySeconds, refreshBeforeExpiry]);

  return { signedUrl, isRefreshing, error, refreshUrl };
};
