import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a signed URL for a SASSA card photo
 * Uses client-side generation for immediate access, but can be switched to
 * server-side generation via edge function for enhanced security
 */
export const getSassaCardSignedUrl = async (
  filePath: string,
  useServerSide: boolean = false
): Promise<string | null> => {
  try {
    if (useServerSide) {
      // Server-side generation via edge function (recommended for production)
      const { data, error } = await supabase.functions.invoke('get-sassa-card-url', {
        body: { filePath },
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }

      return data?.signedUrl || null;
    } else {
      // Client-side generation (faster, but exposes storage access to client)
      const { data, error } = await supabase.storage
        .from('sassa-cards')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error generating signed URL:', error);
        return null;
      }

      return data.signedUrl;
    }
  } catch (error) {
    console.error('Failed to get SASSA card signed URL:', error);
    return null;
  }
};

/**
 * Validates that a file path belongs to the current user
 */
export const validateSassaFilePath = (filePath: string, userId: string): boolean => {
  // File paths should be in format: userId/timestamp.ext
  const pathParts = filePath.split('/');
  return pathParts[0] === userId;
};
